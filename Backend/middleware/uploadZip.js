import multer from "multer";
import path from "path";
import fs from "fs";

const zipDir = path.join(process.cwd(), "temp_zips");

if (!fs.existsSync(zipDir)) {
  fs.mkdirSync(zipDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, zipDir),
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const zipUpload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files allowed"));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export default zipUpload;
