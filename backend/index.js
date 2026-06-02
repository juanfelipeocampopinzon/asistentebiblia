const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');
const { db } = require('./firebase');
const { bibleBooks } = require('./bibleBooks');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const project = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'microservicio-471115';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI(
  apiKey
    ? { apiKey }
    : {
        vertexai: true,
        project,
        location,
        ...(process.env.GOOGLE_APPLICATION_CREDENTIALS && {
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        })
      }
);

const systemInstruction = `
Eres un experto biblico. Ayudas a entender, analizar y comparar pasajes con
claridad, respeto y rigor.

Responde breve por defecto: 45 a 80 palabras. Si el usuario pide mas detalle,
puedes extenderte. Usa parrafos cortos y lenguaje directo.

Cuando expliques un versiculo, da contexto, significado y una aplicacion breve.
Cuando compares traducciones, resume los matices principales.

Debes responder unicamente en JSON valido con esta estructura exacta:
{
  "response": "Tu respuesta aqui. Puedes usar Markdown simple.",
  "topic_tags": ["etiquetas", "tematicas"],
  "related_verses": ["Juan 3:16"]
}
No incluyas texto fuera del JSON ni bloques de codigo Markdown.
`.trim();

let fallbackBiblePromise = null;

async function getFallbackBible() {
  if (!fallbackBiblePromise) {
    fallbackBiblePromise = fetch('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/es_rvr.json')
      .then(response => {
        if (!response.ok) throw new Error('No se pudo descargar la Biblia RVR de respaldo');
        return response.json();
      })
      .then(sourceBooks => sourceBooks.map((sourceBook, index) => {
        const meta = bibleBooks[index];
        return {
          id: meta.id,
          name: meta.name || sourceBook.name,
          abbrev: sourceBook.abbrev,
          abbreviation: sourceBook.abbrev,
          testament: meta.testament,
          chapters: sourceBook.chapters,
          chapterCount: sourceBook.chapters.length,
          order: index + 1,
          translation: 'rvr'
        };
      }));
  }

  return fallbackBiblePromise;
}

async function getBooksFromFirestore() {
  const booksSnapshot = await db.collection('books').orderBy('order').get();
  return booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getBibleBooks() {
  try {
    const firestoreBooks = await getBooksFromFirestore();
    if (firestoreBooks.length > 0) return firestoreBooks;
  } catch (error) {
    console.warn('Firestore no disponible, usando Biblia RVR de respaldo:', error.message);
  }

  return getFallbackBible();
}

async function getBibleBook(bookId) {
  try {
    const bookDoc = await db.collection('books').doc(bookId).get();
    if (bookDoc.exists) return { id: bookDoc.id, ...bookDoc.data() };
  } catch (error) {
    console.warn('Firestore no disponible para libro, usando respaldo:', error.message);
  }

  const fallbackBooks = await getFallbackBible();
  return fallbackBooks.find(book => book.id === bookId) || null;
}

function toBookSummary(book) {
  return {
    id: book.id,
    name: book.name,
    abbreviation: book.abbreviation || book.abbrev,
    abbrev: book.abbrev || book.abbreviation,
    testament: book.testament,
    chapters: book.chapterCount || getChapters(book.chapters).length || 0,
    order: book.order
  };
}

function getChapters(chapters) {
  if (Array.isArray(chapters)) return chapters;
  if (!chapters || typeof chapters !== 'object') return [];

  return Object.entries(chapters)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([, chapter]) => chapter);
}

function normalizeChapter(bookId, bookData, chapterNumber, translation = 'rvr') {
  const chapter = getChapters(bookData.chapters)[chapterNumber - 1];
  if (!chapter) return null;

  return {
    book: bookId,
    bookName: bookData.name,
    chapter: chapterNumber,
    translation: 'rvr',
    verses: chapter.map((text, index) => ({
      number: index + 1,
      text
    }))
  };
}

function extractText(result) {
  if (typeof result?.text === 'string') return result.text;
  if (typeof result?.response?.text === 'function') return result.response.text();
  return result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function cleanJsonText(text) {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: modelName, project, location });
});

app.get('/api/bible/translations', (req, res) => {
  res.json([
    {
      id: 'rvr',
      name: 'Reina-Valera',
      abbreviation: 'RVR',
      language: 'Espanol',
      description: 'Texto biblico en espanol'
    }
  ]);
});

app.get('/api/bible/books', async (req, res) => {
  try {
    const books = await getBibleBooks();
    res.json(books.map(toBookSummary));
  } catch (error) {
    console.error('Error obteniendo libros:', error);
    res.status(500).json({ error: 'Error obteniendo libros', details: error.message });
  }
});

app.get('/api/bible/books/:bookId', async (req, res) => {
  try {
    const book = await getBibleBook(req.params.bookId);
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(book);
  } catch (error) {
    console.error('Error obteniendo libro:', error);
    res.status(500).json({ error: 'Error obteniendo libro', details: error.message });
  }
});

app.get('/api/bible/books/:bookId/chapters/:chapter', async (req, res) => {
  try {
    const chapterNumber = Number(req.params.chapter);
    if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
      return res.status(400).json({ error: 'Capitulo invalido' });
    }

    const book = await getBibleBook(req.params.bookId);
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });

    const chapter = normalizeChapter(
      book.id,
      book,
      chapterNumber,
      req.query.translation || 'rvr'
    );

    if (!chapter) return res.status(404).json({ error: 'Capitulo no encontrado' });
    res.json(chapter);
  } catch (error) {
    console.error('Error obteniendo capitulo:', error);
    res.status(500).json({ error: 'Error obteniendo capitulo', details: error.message });
  }
});

app.get('/api/bible/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const translation = 'rvr';

    if (!query) return res.json([]);

    const books = await getBibleBooks();
    const results = [];

    for (const book of books) {
      const chapters = getChapters(book.chapters);

      for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex++) {
        const chapter = chapters[chapterIndex];

        for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
          const text = chapter[verseIndex];

          if (text.toLowerCase().includes(query)) {
            results.push({
              book: book.id,
              bookName: book.name,
              chapter: chapterIndex + 1,
              verse: verseIndex + 1,
              text,
              translation
            });
          }

          if (results.length >= limit) return res.json(results);
        }
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error buscando en la Biblia:', error);
    res.status(500).json({ error: 'Error buscando en la Biblia', details: error.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'La solicitud debe contener un arreglo de mensajes no vacio.' });
    }

    const contents = messages.map(message => ({
      role: message.role === 'model' || message.role === 'assistant' ? 'model' : 'user',
      parts: Array.isArray(message.parts)
        ? message.parts
        : [{ text: String(message.content || '') }]
    }));

    const result = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.5
      }
    });

    const textResponse = cleanJsonText(extractText(result));
    if (!textResponse) {
      return res.status(500).json({ error: 'La IA devolvio una respuesta vacia.' });
    }

    let aiData;
    try {
      aiData = JSON.parse(textResponse);
    } catch {
      return res.status(500).json({ error: 'La IA devolvio un formato JSON invalido.', raw: textResponse });
    }

    res.json({
      success: true,
      response: aiData.response,
      topic_tags: aiData.topic_tags || [],
      related_verses: aiData.related_verses || []
    });
  } catch (error) {
    console.error('Error al comunicarse con Gemini/Vertex AI:', error);
    res.status(500).json({
      error: 'Error interno del microservicio biblico.',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Microservicio biblico corriendo en http://localhost:${PORT}`);
});
