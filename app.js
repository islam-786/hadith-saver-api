const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();

const app = express();

app.set("case sensitive routing", true);
app.use(bodyParser.json());

app.use(morgan("dev"));

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
//     bookName: "name arabic",
//     chapterName: "chapter name arabic",
//     narratedBy: "narrated by arabic",
//     narratedByDetail: "narrated by detail",
//     arabic: "arabic text",
//     linkedHadiths: ['hadith-1', 'hadith-2'] // optional
//     linkedAyahs: ['ayah-1', 'ayah-2'] // optional
//     relatedHadiths: ['hadith-1', 'hadith-2'] // optional
//     tags: ['tag-1', 'tag-2'] // optional
//   },
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
    book_name: main.bookName,
    chapter_name: main.chapterName,
    narrated_by: main.narratedBy,
    narrated_by_detail: main.narratedByDetail,
    arabic: main.arabic,
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

  const englishId = "en." + advance_numbering; // language.adavance_numbering
  const urduId = "ur." + advance_numbering; // language.adavance_numbering
  const english = req.body.english;
  const urdu = req.body.urdu;

  const englishData = {
    book_name: english.bookName,
    chapter_name: english.chapterName,
    narrated_by: english.narratedBy,
    text: english.text,
  };
  const urduData = {
    book_name: urdu.bookName,
    chapter_name: urdu.chapterName,
    narrated_by: urdu.narratedBy,
    narrated_by_detail: urdu.narratedByDetail,
    text: urdu.text,
  };

  const backResponse = {};

  try {
    await firestore
      .collection("hadith_bukhari")
      .doc(advance_numbering)
      .set(mainData);

    backResponse.main_error = false;
  } catch (e) {
    backResponse.main_error = true;
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
    backResponse.ur_error = true;
  }

  res.status(200).json(backResponse);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
// [END gae_node_request_example]

module.exports = app;
