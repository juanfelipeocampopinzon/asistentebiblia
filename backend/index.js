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
const modelProfiles = {
  chat: {
    primary: process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash-lite',
    fallback: process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite',
    maxOutputTokens: Number(process.env.GEMINI_CHAT_MAX_OUTPUT_TOKENS || 512)
  },
  brief: {
    primary: process.env.GEMINI_BRIEF_MODEL || 'gemini-2.5-flash',
    fallback: process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite',
    maxOutputTokens: Number(process.env.GEMINI_BRIEF_MAX_OUTPUT_TOKENS || 768)
  },
  deep: {
    primary: process.env.GEMINI_DEEP_MODEL || modelName || 'gemini-2.5-pro',
    fallback: process.env.GEMINI_DEEP_FALLBACK_MODEL || 'gemini-3.5-flash',
    secondFallback: process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash',
    maxOutputTokens: Number(process.env.GEMINI_DEEP_MAX_OUTPUT_TOKENS || 2048)
  }
};
const aiConcurrency = Math.max(1, Number(process.env.AI_CONCURRENCY || 2));
const apiKey = process.env.GEMINI_API_KEY;
const googleOAuthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const supportedTranslations = [
  {
    id: 'rvr',
    name: 'Reina-Valera',
    abbreviation: 'RVR',
    language: 'Español',
    available: true,
    order: 1,
    sourceUrl: 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/es_rvr.json'
  },
  {
    id: 'kjv',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'English',
    available: true,
    order: 2,
    sourceUrl: 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'
  },
  {
    id: 'niv',
    name: 'New International Version',
    abbreviation: 'NIV',
    language: 'English',
    available: false,
    order: 3,
    description: 'Pendiente por licencia/fuente autorizada'
  },
  {
    id: 'esv',
    name: 'English Standard Version',
    abbreviation: 'ESV',
    language: 'English',
    available: false,
    order: 4,
    description: 'Pendiente por licencia/fuente autorizada'
  },
  {
    id: 'nlt',
    name: 'New Living Translation',
    abbreviation: 'NLT',
    language: 'English',
    available: false,
    order: 5,
    description: 'Pendiente por licencia/fuente autorizada'
  }
];

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

En chat y preguntas generales, responde breve por defecto: 45 a 80 palabras.
Si el usuario o la interfaz piden un analisis profundo, puedes extenderte a
250 a 450 palabras con secciones claras. Usa parrafos cortos y lenguaje directo.

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

class AiQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.active = 0;
    this.queue = [];
  }

  run(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.next();
    });
  }

  next() {
    if (this.active >= this.concurrency || this.queue.length === 0) return;

    const item = this.queue.shift();
    this.active += 1;

    item.task()
      .then(item.resolve)
      .catch(item.reject)
      .finally(() => {
        this.active -= 1;
        this.next();
      });
  }
}

const aiQueue = new AiQueue(aiConcurrency);
const fallbackBiblePromises = new Map();

function getTranslationConfig(translationId = 'rvr') {
  return supportedTranslations.find(translation => translation.id === translationId && translation.available) || supportedTranslations[0];
}

function getExactTranslationConfig(translationId = 'rvr') {
  return supportedTranslations.find(translation => translation.id === translationId);
}

function getChapters(chapters) {
  if (Array.isArray(chapters)) return chapters;
  if (!chapters || typeof chapters !== 'object') return [];

  return Object.entries(chapters)
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([, chapter]) => chapter);
}

async function getFallbackBible(translationId = 'rvr') {
  const translation = getTranslationConfig(translationId);

  if (!fallbackBiblePromises.has(translation.id)) {
    fallbackBiblePromises.set(
      translation.id,
      fetch(translation.sourceUrl)
        .then(response => {
          if (!response.ok) throw new Error(`No se pudo descargar ${translation.abbreviation}`);
          return response.json();
        })
        .then(sourceBooks => sourceBooks.map((sourceBook, index) => {
          const meta = bibleBooks[index];
          return {
            id: meta.id,
            name: translation.id === 'rvr' ? (meta.name || sourceBook.name) : sourceBook.name,
            spanishName: meta.name,
            abbrev: sourceBook.abbrev,
            abbreviation: sourceBook.abbrev,
            testament: meta.testament,
            chapters: sourceBook.chapters,
            chapterCount: sourceBook.chapters.length,
            order: index + 1,
            translation: translation.id
          };
        }))
    );
  }

  return fallbackBiblePromises.get(translation.id);
}

async function getBooksFromFirestore(translationId = 'rvr') {
  const translation = getTranslationConfig(translationId);
  const booksSnapshot = await db
    .collection('translations')
    .doc(translation.id)
    .collection('books')
    .orderBy('order')
    .get();

  if (!booksSnapshot.empty) {
    return booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  if (translation.id === 'rvr') {
    const legacySnapshot = await db.collection('books').orderBy('order').get();
    return legacySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  return [];
}

async function getBibleBooks(translationId = 'rvr') {
  try {
    const firestoreBooks = await getBooksFromFirestore(translationId);
    if (firestoreBooks.length > 0) return firestoreBooks;
  } catch (error) {
    console.warn('Firestore no disponible, usando respaldo:', error.message);
  }

  return getFallbackBible(translationId);
}

async function getBibleBook(bookId, translationId = 'rvr') {
  const translation = getTranslationConfig(translationId);

  try {
    const bookDoc = await db
      .collection('translations')
      .doc(translation.id)
      .collection('books')
      .doc(bookId)
      .get();

    if (bookDoc.exists) return { id: bookDoc.id, ...bookDoc.data() };

    if (translation.id === 'rvr') {
      const legacyDoc = await db.collection('books').doc(bookId).get();
      if (legacyDoc.exists) return { id: legacyDoc.id, ...legacyDoc.data() };
    }
  } catch (error) {
    console.warn('Firestore no disponible para libro, usando respaldo:', error.message);
  }

  const fallbackBooks = await getFallbackBible(translation.id);
  return fallbackBooks.find(book => book.id === bookId) || null;
}

function toBookSummary(book) {
  return {
    id: book.id,
    name: book.name,
    spanishName: book.spanishName,
    abbreviation: book.abbreviation || book.abbrev,
    abbrev: book.abbrev || book.abbreviation,
    testament: book.testament,
    chapters: book.chapterCount || getChapters(book.chapters).length || 0,
    order: book.order
  };
}

function normalizeChapter(bookId, bookData, chapterNumber, translationId = 'rvr') {
  const chapter = getChapters(bookData.chapters)[chapterNumber - 1];
  if (!chapter) return null;

  return {
    book: bookId,
    bookName: bookData.name,
    chapter: chapterNumber,
    translation: bookData.translation || translationId,
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableAiError(error) {
  const message = String(error?.message || '');
  return message.includes('"code":429')
    || message.includes('RESOURCE_EXHAUSTED')
    || message.includes('resource exhausted')
    || message.includes('"code":503')
    || message.includes('UNAVAILABLE')
    || message.includes('"code":500');
}

function normalizeAiTask(task = 'chat', depth = 'brief') {
  if (task === 'explain' || task === 'compare') {
    return depth === 'deep' ? 'deep' : 'brief';
  }

  if (task === 'deep') return 'deep';
  if (task === 'brief') return 'brief';
  return 'chat';
}

function getThinkingConfig(model, profileName) {
  if (model.startsWith('gemini-3.')) {
    return {
      thinkingLevel: profileName === 'deep' ? 'LOW' : 'MINIMAL'
    };
  }

  if (model.startsWith('gemini-2.5-flash') || model.startsWith('gemini-2.5-flash-lite')) {
    return {
      thinkingBudget: profileName === 'deep' ? 1024 : 0
    };
  }

  if (model.startsWith('gemini-2.5-pro')) {
    return {
      thinkingBudget: 128
    };
  }

  return undefined;
}

function getModelAttempts(profileName) {
  const profile = modelProfiles[profileName] || modelProfiles.chat;
  return [profile.primary, profile.fallback, profile.secondFallback]
    .filter(Boolean)
    .filter((model, index, models) => models.indexOf(model) === index);
}

async function generateWithRetries({ model, profileName, contents, config }) {
  const attempts = Number(process.env.AI_RETRY_ATTEMPTS || 3);
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const thinkingConfig = getThinkingConfig(model, profileName);
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          ...config,
          ...(thinkingConfig ? { thinkingConfig } : {})
        }
      });
    } catch (error) {
      lastError = error;
      if (!isRetryableAiError(error) || attempt === attempts - 1) break;
      const delay = 700 * (2 ** attempt) + Math.floor(Math.random() * 250);
      await sleep(delay);
    }
  }

  throw lastError;
}

async function generateWithModelFallback({ profileName, contents }) {
  const profile = modelProfiles[profileName] || modelProfiles.chat;
  const models = getModelAttempts(profileName);
  const errors = [];

  for (const model of models) {
    try {
      const result = await aiQueue.run(() => generateWithRetries({
        model,
        profileName,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: profileName === 'deep' ? 0.45 : 0.35,
          maxOutputTokens: profile.maxOutputTokens
        }
      }));

      return { result, modelUsed: model, fallbackUsed: model !== models[0], errors };
    } catch (error) {
      errors.push({ model, error: error.message });
      if (!isRetryableAiError(error)) break;
    }
  }

  const last = errors[errors.length - 1];
  const error = new Error(last?.error || 'No hubo modelos disponibles para responder.');
  error.modelErrors = errors;
  throw error;
}

function trimContentsForTask(contents, profileName) {
  const maxMessages = profileName === 'chat' ? 8 : 4;
  return contents.slice(-maxMessages);
}

async function verifyGoogleToken(idToken) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) throw new Error('Token de Google invalido');

  const profile = await response.json();
  if (googleOAuthClientId && profile.aud !== googleOAuthClientId) {
    throw new Error('Token emitido para otro cliente OAuth');
  }

  return {
    uid: profile.sub,
    email: profile.email,
    name: profile.name || profile.email,
    picture: profile.picture
  };
}

async function requireGoogleUser(req, res, next) {
  try {
    if (process.env.AI_AUTH_BYPASS === 'true') {
      req.user = {
        uid: 'local-dev-user',
        email: 'local-dev@example.com',
        name: 'Local Dev',
        picture: ''
      };
      return next();
    }

    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
    if (!token) return res.status(401).json({ error: 'Inicia sesion con Google para usar la IA.' });

    req.user = await verifyGoogleToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Sesion de Google invalida o expirada.', details: error.message });
  }
}

async function saveAiHistory(user, payload) {
  const userRef = db.collection('users').doc(user.uid);
  await userRef.set({
    email: user.email,
    name: user.name,
    picture: user.picture,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  await userRef.collection('aiHistory').add({
    ...payload,
    createdAt: new Date().toISOString()
  });
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    model: modelName,
    modelProfiles,
    aiConcurrency,
    project,
    location
  });
});

app.get('/api/bible/translations', (req, res) => {
  res.json(supportedTranslations.map(({ sourceUrl, ...translation }) => translation));
});

app.get('/api/bible/books', async (req, res) => {
  try {
    const books = await getBibleBooks(req.query.translation || 'rvr');
    res.json(books.map(toBookSummary));
  } catch (error) {
    console.error('Error obteniendo libros:', error);
    res.status(500).json({ error: 'Error obteniendo libros', details: error.message });
  }
});

app.get('/api/bible/books/:bookId', async (req, res) => {
  try {
    const book = await getBibleBook(req.params.bookId, req.query.translation || 'rvr');
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

    const translation = getTranslationConfig(req.query.translation || 'rvr');
    const book = await getBibleBook(req.params.bookId, translation.id);
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });

    const chapter = normalizeChapter(book.id, book, chapterNumber, translation.id);
    if (!chapter) return res.status(404).json({ error: 'Capitulo no encontrado' });
    res.json(chapter);
  } catch (error) {
    console.error('Error obteniendo capitulo:', error);
    res.status(500).json({ error: 'Error obteniendo capitulo', details: error.message });
  }
});

app.get('/api/bible/compare/:bookId/:chapter/:verse', async (req, res) => {
  try {
    const chapterNumber = Number(req.params.chapter);
    const verseNumber = Number(req.params.verse);
    const requested = String(req.query.translations || 'rvr,kjv')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const comparisons = [];

    for (const translationId of requested) {
      const translation = getExactTranslationConfig(translationId);
      if (!translation?.available) continue;

      const book = await getBibleBook(req.params.bookId, translation.id);
      const chapter = book ? normalizeChapter(book.id, book, chapterNumber, translation.id) : null;
      const verse = chapter?.verses.find(item => item.number === verseNumber);

      if (verse) {
        comparisons.push({
          translation: translation.id,
          abbreviation: translation.abbreviation,
          name: translation.name,
          language: translation.language,
          text: verse.text
        });
      }
    }

    res.json(comparisons);
  } catch (error) {
    console.error('Error comparando versiculo:', error);
    res.status(500).json({ error: 'Error comparando versiculo', details: error.message });
  }
});

app.get('/api/bible/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const translation = getTranslationConfig(req.query.translation || 'rvr');

    if (!query) return res.json([]);

    const books = await getBibleBooks(translation.id);
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
              translation: translation.id
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

app.get('/api/me/history', requireGoogleUser, async (req, res) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(req.user.uid)
      .collection('aiHistory')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    res.status(500).json({ error: 'No se pudo cargar el historial', details: error.message });
  }
});

app.post('/api/chat', requireGoogleUser, async (req, res) => {
  try {
    const { messages, task = 'chat', depth = 'brief' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'La solicitud debe contener un arreglo de mensajes no vacio.' });
    }

    const profileName = normalizeAiTask(task, depth);
    const contents = trimContentsForTask(messages.map(message => ({
      role: message.role === 'model' || message.role === 'assistant' ? 'model' : 'user',
      parts: Array.isArray(message.parts)
        ? message.parts
        : [{ text: String(message.content || '') }]
    })), profileName);

    const aiResult = await generateWithModelFallback({
      profileName,
      contents
    });

    const textResponse = cleanJsonText(extractText(aiResult.result));
    if (!textResponse) {
      return res.status(500).json({ error: 'La IA devolvio una respuesta vacia.' });
    }

    let aiData;
    try {
      aiData = JSON.parse(textResponse);
    } catch {
      return res.status(500).json({ error: 'La IA devolvio un formato JSON invalido.', raw: textResponse });
    }

    const responsePayload = {
      success: true,
      response: aiData.response,
      topic_tags: aiData.topic_tags || [],
      related_verses: aiData.related_verses || [],
      model: aiResult.modelUsed,
      fallback: aiResult.fallbackUsed,
      profile: profileName
    };

    await saveAiHistory(req.user, {
      messages,
      task,
      depth,
      profile: profileName,
      model: aiResult.modelUsed,
      fallback: aiResult.fallbackUsed,
      response: responsePayload.response,
      topic_tags: responsePayload.topic_tags,
      related_verses: responsePayload.related_verses
    });

    res.json(responsePayload);
  } catch (error) {
    console.error('Error al comunicarse con Gemini/Vertex AI:', error);
    res.status(500).json({
      error: 'Error interno del microservicio biblico.',
      details: error.message,
      modelErrors: error.modelErrors || []
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Microservicio biblico corriendo en http://localhost:${PORT}`);
});
