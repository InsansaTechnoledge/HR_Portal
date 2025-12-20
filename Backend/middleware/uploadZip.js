import multer from "multer";

const storage = multer.diskStorage({
  destination: "temp_zips",
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

export const zipUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("zip")) cb(null, true);
    else cb(new Error("Only ZIP allowed"));
  },
});

export default zipUpload;