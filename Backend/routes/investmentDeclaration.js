import express from 'express';
import checkCookies from '../middleware/checkCookies.js';
import uploadInvestmentDocuments from '../middleware/uploadInvestmentDocuments.js';
import {
    createOrUpdateDeclaration,
    submitDeclaration,
    getDeclarationById,
    getDeclarationByEmployee,
    getAllDeclarations,
    updateInvestmentDeclarationStatus,
    deleteDeclaration,
    uploadDocumentGridFS,
    downloadDocument,
    previewDocument
} from '../controller/investmentDeclarationController.js';

const router = express.Router();

// Create or Update Declaration
router.post('/declaration', checkCookies, createOrUpdateDeclaration);

// Submit Declaration
router.post('/declaration/submit', checkCookies, submitDeclaration);

// Get Declaration by Employee and Financial Year
router.get('/declaration/employee', checkCookies, getDeclarationByEmployee);

// Get Declaration by ID
router.get('/declaration/:id', checkCookies, getDeclarationById);

// Get All Declarations (Admin only)
router.get('/declarations/all', checkCookies, getAllDeclarations);

// Update Declaration Status (Admin/Accountant only)
router.put('/declaration/status', checkCookies, updateInvestmentDeclarationStatus);

// Delete Declaration (Admin only)
router.delete('/declaration/:declarationId', checkCookies, deleteDeclaration);

// Upload Documents to GridFS
router.post('/declaration/:declarationId/upload-document', checkCookies, uploadInvestmentDocuments.single('document'), uploadDocumentGridFS);

// Download Document
router.get('/document/download/:uploadId', checkCookies, downloadDocument);

// Preview Document
router.get('/document/preview/:uploadId', checkCookies, previewDocument);

export default router;
