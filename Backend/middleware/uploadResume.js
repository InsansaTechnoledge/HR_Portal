import fs from "fs-extra";
import path from "path";
import multer from "multer";

const ensureTempDir = async (dir, cb) => {
  try {
    await fs.ensureDir(dir);
    cb(null, dir);
  } catch (err) {
    cb(err);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "temp_candidate_resumes");
    ensureTempDir(dir, cb);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = path.basename(file.originalname, ext);
    const safeBase = base.replace(/[^a-z0-9]+/gi, "_") || "resume";
    cb(null, `${Date.now()}_${safeBase}${ext}`);
  },
});

const allowedExtensions = new Set(["pdf", "doc", "docx", "png", "jpg", "jpeg"]);

export const uploadResume = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname.split(".").pop() || "").toLowerCase();
    if (!allowedExtensions.has(ext)) {
      return cb(new Error("Unsupported file type"));
    }
    cb(null, true);
  },
});

export default uploadResume;
