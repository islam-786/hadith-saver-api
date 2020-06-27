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

app.post("/hadith", async (req, res) => {
  const advance_numbering = req.body.advanceNumbering;
  const data = {
    international_numbering: req.body.internationalNumbering,
    number_in_book: req.body.numberInBook,
    book_number: req.body.bookNumber,
    chapter_number: req.body.chapterNumber,
    book_name: req.body.book_name,
    chapter_name: req.body.chapter_name,
    narrated_by: req.body.narratedBy,
    narrated_by_detail: req.body.narratedByDetail,
    arabic: req.body.arabic,
  };

  try {
    const response = await firestore
      .collection("hadith_buhkari")
      .doc(advance_numbering)
      .set(data);

    res.status(200).json({
      error: false,
      message: "Saved",
    });
  } catch (e) {
    res.status(200).json({
      error: true,
      message: "Failed",
    });
  }
});

app.post("/translation", async (req, res) => {
  const englishId = req.body.englishId; // language.adavance_numbering
  const urduId = req.body.urduId; // language.adavance_numbering
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
    const enResponse = await firestore
      .collection("hadith_bukhari_translations")
      .doc(englishId)
      .set(englishData);
    backResponse.en_error = false;
  } catch (e) {
    backResponse.en_error = true;
  }

  try {
    const urResponse = await firestore
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
