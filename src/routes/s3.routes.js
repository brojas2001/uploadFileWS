const express = require("express");
const {generateUploadURL, generateDownloadURL, createFileRecord, listFiles} = require("../controller/s3.controller.js");

const router = express.Router();

router.get("/upload", generateUploadURL);
router.get("/download", generateDownloadURL);
router.post("/file-uploaded", createFileRecord);
router.get("/files", listFiles);

module.exports = router;
