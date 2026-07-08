const express = require("express");
const multer = require("multer");
const { ImageAnnotatorClient } = require("@google-cloud/vision");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Cloud Run automatically provides credentials through its service account.
// No keyFilename needed.
const client = new ImageAnnotatorClient();

app.post("/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const [result] = await client.textDetection(req.file.buffer);
    const detections = result.textAnnotations;

    res.json({
      text: detections.length ? detections[0].description : ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("OCR server is running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
