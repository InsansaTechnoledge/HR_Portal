import multer from 'multer';

// Use memory storage because we'll upload directly to Google Drive
const storage = multer.memoryStorage();

function fileFilter (req, file, cb) {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
    ];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
}

const uploadInvestmentDocuments = multer({ storage, fileFilter });

export default uploadInvestmentDocuments;
