const { db } = require('./firebase');
const { bibleBooks } = require('./bibleBooks');

const translations = [
  {
    id: 'rvr',
    name: 'Reina-Valera',
    abbreviation: 'RVR',
    language: 'Español',
    sourceUrl: 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/es_rvr.json'
  },
  {
    id: 'kjv',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'English',
    sourceUrl: 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json'
  }
];

function chaptersToFirestore(chapters) {
  return Object.fromEntries(
    chapters.map((chapter, chapterIndex) => [String(chapterIndex + 1), chapter])
  );
}

async function deleteCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  if (snapshot.empty) return 0;

  let batch = db.batch();
  let operationCount = 0;
  let deletedCount = 0;

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
    operationCount++;
    deletedCount++;

    if (operationCount === 450) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) await batch.commit();
  return deletedCount;
}

async function seedTranslation(translation) {
  console.log(`Descargando ${translation.abbreviation}...`);
  const response = await fetch(translation.sourceUrl);
  if (!response.ok) throw new Error(`Error descargando ${translation.id}`);

  const bibleData = await response.json();
  if (bibleData.length !== bibleBooks.length) {
    throw new Error(`${translation.id}: se esperaban ${bibleBooks.length} libros, llegaron ${bibleData.length}.`);
  }

  const translationRef = db.collection('translations').doc(translation.id);
  await translationRef.set({
    id: translation.id,
    name: translation.name,
    abbreviation: translation.abbreviation,
    language: translation.language,
    available: true,
    order: translation.id === 'rvr' ? 1 : 2
  });

  const deleted = await deleteCollection(translationRef.collection('books'));
  if (deleted) console.log(`${translation.abbreviation}: ${deleted} libros anteriores eliminados.`);

  let batch = db.batch();
  let operationCount = 0;

  for (let i = 0; i < bibleData.length; i++) {
    const sourceBook = bibleData[i];
    const canonicalBook = bibleBooks[i];
    const bookData = {
      id: canonicalBook.id,
      name: translation.id === 'rvr' ? (canonicalBook.name || sourceBook.name) : sourceBook.name,
      spanishName: canonicalBook.name,
      abbrev: sourceBook.abbrev,
      abbreviation: sourceBook.abbrev,
      testament: canonicalBook.testament,
      chapters: chaptersToFirestore(sourceBook.chapters),
      chapterCount: sourceBook.chapters.length,
      order: i + 1,
      translation: translation.id
    };

    batch.set(translationRef.collection('books').doc(canonicalBook.id), bookData);
    operationCount++;

    if (translation.id === 'rvr') {
      batch.set(db.collection('books').doc(canonicalBook.id), bookData);
      operationCount++;
    }

    if (operationCount >= 450) {
      await batch.commit();
      batch = db.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0) await batch.commit();
  console.log(`${translation.abbreviation}: ${bibleData.length} libros subidos.`);
}

async function seedBible() {
  try {
    for (const translation of translations) {
      await seedTranslation(translation);
    }

    console.log('Traducciones sembradas correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
    process.exit(1);
  }
}

seedBible();
