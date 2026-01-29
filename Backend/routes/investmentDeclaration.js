import express from 'express';
import checkCookies from '../middleware/checkCookies.js';
import uploadInvestmentDocuments from '../middleware/uploadInvestmentDocuments.js';
import {
    createOrUpdateDeclaration,
    submitDeclaration,
    getDeclarationById,
    getDeclarationByEmployee,
    getAllDeclarations,
    approveDeclaration,
    rejectDeclaration,
    deleteDeclaration,
    uploadDocumentsToGoogleDrive
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

// Approve Declaration (Admin only)
router.put('/declaration/approve', checkCookies, approveDeclaration);

// Reject Declaration (Admin only)
router.put('/declaration/reject', checkCookies, rejectDeclaration);

// Delete Declaration (Admin only)
router.delete('/declaration/:declarationId', checkCookies, deleteDeclaration);

// Upload Documents to Google Drive
router.post('/declaration/:declarationId/upload-document', checkCookies, uploadInvestmentDocuments.single('document'), uploadDocumentsToGoogleDrive);

export default router;
