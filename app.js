const express = require("express");
const bodyParser = require("body-parser");
//const morgan = require("morgan");
const cors = require("cors");

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

// app.use(cors());

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

app.post("/chapter", async (req, res) => {
  try {
    const chapter_number = req.body.chapter_number.trim();
    const book_number = req.body.book_number.trim();

    const arabicChapter = {
      chapter_name: req.body.arabic.chapterName.trim(),
    };
    const englishChapter = {
      chapter_name: req.body.english.chapterName.trim(),
    };
    const urduChapter = {
      chapter_name: req.body.urdu.chapterName.trim(),
    };

    const arabicBookName = {
      book_name: req.body.arabic.bookName.trim(),
    };

    const englishBookName = {
      book_name: req.body.english.bookName.trim(),
    };

    const urduBookName = {
      book_name: req.body.urdu.bookName.trim(),
    };

    const backResponse = {};

    try {
      await firestore
        .collection("hadith_bukhari_chapters")
        .doc("ar." + chapter_number)
        .set(arabicChapter);
      await firestore
        .collection("hadith_bukhari_chapters")
        .doc("en." + chapter_number)
        .set(englishChapter);
      await firestore
        .collection("hadith_bukhari_chapters")
        .doc("ur." + chapter_number)
        .set(urduChapter);
      backResponse.chapter_error = false;
    } catch (e) {
      console.log(e);
      backResponse.chapter_error = true;
    }

    try {
      await firestore
        .collection("hadith_bukhari_books")
        .doc("ar." + book_number)
        .set(arabicBookName);
      await firestore
        .collection("hadith_bukhari_books")
        .doc("en." + book_number)
        .set(englishBookName);
      await firestore
        .collection("hadith_bukhari_books")
        .doc("ur." + book_number)
        .set(urduBookName);
      backResponse.book_error = false;
    } catch (e) {
      console.log(e);
      backResponse.book_error = true;
    }

    res.status(200).json(backResponse);
  } catch (error) {
    console.log(error);
    const backResponse = {};
    backResponse.book_error = true;
    backResponse.chapter_error = true;
    backResponse.err = error.message;
    res.status(200).json(backResponse);
  }
});

app.post("/hadith", async (req, res) => {
  try {
    const advance_numbering = req.body.advanceNumbering.trim();
    const main = req.body.main;
    const mainData = {
      international_numbering: main.internationalNumbering.trim(),
      number_in_book: main.numberInBook,
      book_number: main.bookNumber,
      chapter_number: main.chapterNumber,
    };

    if (main.linkedHadiths) {
      mainData.linked_hadiths = main.linkedHadiths.split(",");
    }

    if (main.linkedAyahs) {
      mainData.linked_ayahs = main.linkedAyahs.split(",");
    }

    if (main.relatedHadiths) {
      mainData.related_hadiths = main.relatedHadiths.split(",");
    }

    if (main.tags) {
      mainData.tags = main.tags.split(",");
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
      narrated_by: arabic.narratedBy.trim(),
      narrated_by_detail: arabic.narratedByDetail.trim(),
      text: arabic.text.trim(),
    };

    const englishData = {
      book_number: "en." + main.bookNumber,
      chapter_number: "en." + main.chapterNumber,
      narrated_by: english.narratedBy.trim(),
      text: english.text.trim(),
    };
    const urduData = {
      book_number: "ur." + main.bookNumber,
      chapter_number: "ur." + main.chapterNumber,
      narrated_by: urdu.narratedBy.trim(),
      text: urdu.text.trim(),
    };

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

    res.status(200).json(backResponse);
  } catch (error) {
    console.log(error);
    const backResponse = {};
    backResponse.main_error = true;
    backResponse.ar_error = true;
    backResponse.en_error = true;
    backResponse.ur_error = true;
    backResponse.err = error.message;
    res.status(200).json(backResponse);
  }
});

// DUPLICATE HADITH
app.get("/duplicate/:number", async (req, res, next) => {
  try {
    const query = await firestore
      .collection("hadith_bukhari")
      .where("international_numbering", "==", req.params.number)
      .limit(1)
      .get();

    let hadith;
    query.forEach((snap) => {
      hadith = snap.data();
      hadith.id = snap.id;
    });

    const urduHadithSnap = await firestore
      .collection("hadith_bukhari_translations")
      .doc("ur." + hadith.id)
      .get();

    const urduHadith = urduHadithSnap.data();

    res.status(200).json({
      advance_number: hadith.id,
      international_number: hadith.international_numbering,
      urdu_text: urduHadith.text,
    });
  } catch (e) {
    console.log(e);
    res.status(200).json({
      error: e.message,
    });
  }
});

app.post("/duplicate-save", async (req, res, next) => {
  try {
    // Get old hadith
    // Add new hadith with new advance number
    // delete previous hadith
    // add new hadith translations
    // delete old hadith translation
    const oldHadithSnap = await firestore
      .collection("hadith_bukhari")
      .doc(req.body.old_advance_number)
      .get();

    const oldHadith = oldHadithSnap.data();

    await firestore
      .collection("hadith_buhkari")
      .doc(req.body.new_advance_number)
      .set({
        ...oldHadith,
        linked_hadiths: req.body.linkedHadiths.split(","),
      });

    await firestore
      .collection("hadith_bukhari")
      .doc(req.body.old_advance_number)
      .delete();

    const arSnap = await firestore
      .collection("hadith_bukhari_translations")
      .doc("ar." + req.body.old_advance_number)
      .get();

    const arHadith = arSnap.data();

    await firestore
      .collection("hadith_bukhari_translations")
      .doc("ar." + req.body.new_advance_number)
      .set(arHadith);

    await firestore
      .collection("hadith_bukhari_translations")
      .doc("ar." + req.body.old_advance_number)
      .delete();

    // FOR URDU
    const urSnap = await firestore
      .collection("hadith_bukhari_translations")
      .doc("ur." + req.body.old_advance_number)
      .get();

    const urHadith = urSnap.data();

    await firestore
      .collection("hadith_bukhari_translations")
      .doc("ur." + req.body.new_advance_number)
      .set(urHadith);

    await firestore
      .collection("hadith_bukhari_translations")
      .doc("ur." + req.body.old_advance_number)
      .delete();

    // FOR ENGLISH
    const enSnap = await firestore
      .collection("hadith_bukhari_translations")
      .doc("en." + req.body.old_advance_number)
      .get();

    const enHadith = enSnap.data();

    await firestore
      .collection("hadith_bukhari_translations")
      .doc("en." + req.body.new_advance_number)
      .set(enHadith);

    await firestore
      .collection("hadith_bukhari_translations")
      .doc("en." + req.body.old_advance_number)
      .delete();

    res.status(200).json({
      message: "Saved hadith " + req.body.old_advance_number,
    });
  } catch (e) {
    console.log(e);
    res.status(200).json({
      message: e.message,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
// [END gae_node_request_example]

module.exports = app;
