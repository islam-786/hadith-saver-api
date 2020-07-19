const express = require("express");
const bodyParser = require("body-parser");
//const morgan = require("morgan");

const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();

const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.set("case sensitive routing", true);
app.use(bodyParser.json());

//app.use(morgan("dev"));

app.post("/test", (req, res) => {
  const backResponse = {};
  backResponse.ur_error = false;

  res.status(200).json(backResponse);
});

/////////// Schema //////////////
// {
//   advanceNumbering: "123-a",
//   main: {
//     internationalNumbering: "123-ab",
//     numberInBook: 12,
//     bookNumber: 1,
//     chapterNumber: 2,
//     linkedHadiths: ['hadith-1', 'hadith-2'] // optional
//     linkedAyahs: ['ayah-1', 'ayah-2'] // optional
//     relatedHadiths: ['hadith-1', 'hadith-2'] // optional
//     tags: ['tag-1', 'tag-2'] // optional
//   },

//  arabic: {
//   bookName: "name arabic",
//       chapterName: "chapter name arabic",
//       narratedBy: "narrated by arabic",
//       narratedByDetail: "narrated by detail",
//       arabic: "arabic text",
//  }
//   english: {
//     bookName: "book name",
//     chapterName: "chapter name",
//     narratedBy: "narated",
//     text: "text in english"
//   },
//   urdu: {
//     bookName: "book name",
//     chapterName: "chapter name",
//     narratedBy: "narated",
//     narratedByDetail: "narrated by detail",
//     text: "text in urdu"
//   }
// }

app.post("/hadith", async (req, res) => {
  const advance_numbering = req.body.advanceNumbering;
  const main = req.body.main;
  const mainData = {
    international_numbering: main.internationalNumbering,
    number_in_book: main.numberInBook,
    book_number: main.bookNumber,
    chapter_number: main.chapterNumber,
  };

  if (main.linkedHadiths) {
    mainData.linked_hadiths = main.linkedHadiths;
  }

  if (main.linkedAyahs) {
    mainData.linked_ayahs = main.linkedAyahs;
  }

  if (main.relatedHadiths) {
    mainData.related_hadiths = main.relatedHadiths;
  }

  if (main.tags) {
    mainData.tags = main.tags;
  }

  const arabicId = "ar." + advance_numbering; // language.adavance_numbering
  const englishId = "en." + advance_numbering; // language.adavance_numbering
  const urduId = "ur." + advance_numbering; // language.adavance_numbering
  const arabic = req.body.arabic;
  const english = req.body.english;
  const urdu = req.body.urdu;

  const arabicData = {
    book_number: "ar." + main.bookNumber,
    chapter_number: "ar." + main.chapterNumber,
    narrated_by: arabic.narratedBy,
    narrated_by_detail: arabic.narratedByDetail,
    arabic: arabic.text,
  };

  const englishData = {
    book_number: "en." + main.bookNumber,
    chapter_number: "en." + main.chapterNumber,
    narrated_by: english.narratedBy,
    text: english.text,
  };
  const urduData = {
    book_number: "ur." + main.bookNumber,
    chapter_number: "ur." + main.chapterNumber,
    narrated_by: urdu.narratedBy,
    text: urdu.text,
  };

  const arabicChapter = {
    chapter_name = arabic.chapterName
  }
  const englishChapter = {
    chapter_name = english.chapterName
  }
  const urduChapter = {
    chapter_name = urdu.chapterName
  }

  const arabicBookName = {
    book_name = "ar."+arabic.bookName
  }

  const englishBookName = {
    book_name = "en."+english.bookName
  }

  const urduBookName = {
    book_name = "ur."+urdu.bookName
  }

  const backResponse = {};

  try {
    await firestore
      .collection("hadith_bukhari")
      .doc(advance_numbering)
      .set(mainData);

    backResponse.main_error = false;
  } catch (e) {
    console.log(e);
    backResponse.main_error = true;
  }

  try {
    await firestore
      .collection("hadith_bukhari_translations")
      .doc(arabicId)
      .set(arabicData);
    backResponse.ar_error = false;
  } catch (e) {
    backResponse.ar_error = true;
  }

  try {
    await firestore
      .collection("hadith_bukhari_translations")
      .doc(englishId)
      .set(englishData);
    backResponse.en_error = false;
  } catch (e) {
    backResponse.en_error = true;
  }

  try {
    await firestore
      .collection("hadith_bukhari_translations")
      .doc(urduId)
      .set(urduData);
    backResponse.ur_error = false;
  } catch (e) {
    console.log(e);
    backResponse.ur_error = true;
  }

  try {
    await firestore
      .collection("hadith_bukhari_chapters")
      .doc("ar."+main.chapterNumber)
      .set(arabicChapter);
      await firestore
      .collection("hadith_bukhari_chapters")
      .doc("en."+main.chapterNumber)
      .set(englishChapter);
      await firestore
      .collection("hadith_bukhari_chapters")
      .doc("ur."+main.chapterNumber)
      .set(urduChapter);
    backResponse.chapter_error = false;
  } catch (e) {
    console.log(e);
    backResponse.chapter_error = true;
  }

  try {
    await firestore
      .collection("hadith_bukhari_books")
      .doc("ar."+main.bookNumber)
      .set(arabicBookName);
      await firestore
      .collection("hadith_bukhari_books")
      .doc("en."+main.bookNumber)
      .set(englishBookName);
      await firestore
      .collection("hadith_bukhari_books")
      .doc("ur."+main.bookNumber)
      .set(urduBookName);
    backResponse.book_error = false;
  } catch (e) {
    console.log(e);
    backResponse.book_error = true;
  }

  res.status(200).json(backResponse);
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
// [END gae_node_request_example]

module.exports = app;
