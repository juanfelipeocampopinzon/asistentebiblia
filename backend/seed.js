const { db } = require('./firebase');
const { bibleBooks } = require('./bibleBooks');

async function deleteExistingBooks() {
  const snapshot = await db.collection('books').get();
  if (snapshot.empty) return;

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

  if (operationCount > 0) {
    await batch.commit();
  }

  console.log(`Libros anteriores eliminados: ${deletedCount}`);
}

async function seedBible() {
  console.log('Obteniendo Biblia RVR en formato JSON...');

  try {
    const response = await fetch('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/es_rvr.json');
    if (!response.ok) throw new Error('Error al descargar el JSON');

    const bibleData = await response.json();
    console.log(`Descargados ${bibleData.length} libros.`);

    if (bibleData.length !== bibleBooks.length) {
      throw new Error(`Se esperaban ${bibleBooks.length} libros, pero llegaron ${bibleData.length}.`);
    }

    await deleteExistingBooks();

    const batch = db.batch();

    for (let i = 0; i < bibleData.length; i++) {
      const sourceBook = bibleData[i];
      const canonicalBook = bibleBooks[i];
      const bookRef = db.collection('books').doc(canonicalBook.id);

      const chapters = Object.fromEntries(
        sourceBook.chapters.map((chapter, chapterIndex) => [String(chapterIndex + 1), chapter])
      );

      batch.set(bookRef, {
        id: canonicalBook.id,
        name: canonicalBook.name || sourceBook.name,
        abbrev: sourceBook.abbrev,
        abbreviation: sourceBook.abbrev,
        testament: canonicalBook.testament,
        chapters,
        chapterCount: sourceBook.chapters.length,
        order: i + 1,
        translation: 'rvr'
      });
    }

    console.log('Subiendo 66 libros a Firestore...');
    await batch.commit();
    console.log('Biblia RVR subida exitosamente a Firestore.');
    process.exit(0);
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
    process.exit(1);
  }
}

seedBible();
