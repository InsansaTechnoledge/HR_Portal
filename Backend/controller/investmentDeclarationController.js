import InvestmentDeclaration from '../models/InvestmentDeclaration.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';
import InvestUpload from '../models/InvestUpload.js';
import mongoose from 'mongoose';
import { getGridFSBucket } from '../utils/gridFs.js';
import { Readable } from 'stream';

const hasRole = (user, roles = []) => user && roles.includes(user.role);

export const createOrUpdateDeclaration = async (req, res) => {
    try {
        const currentUser = req.user;
        // Allowed: employee, accountant, admin
        if (!hasRole(currentUser, ['employee', 'user', 'accountant', 'admin', 'superAdmin'])) {
            return res.status(403).json({ message: 'Not authorized to create declaration' });
        }

        const { employeeId, financialYear, status = 'Draft', ...rest } = req.body;

        if (!employeeId || !financialYear) {
            return res.status(400).json({ message: 'employeeId and financialYear are required' });
        }

        const emp = await Employee.findById(employeeId);
        if (!emp) return res.status(404).json({ message: 'Employee not found' });

        const payload = {
            employeeId: emp._id,
            employeeName: emp.name,
            employeeCode: emp.empId,
            employeeEmail: emp.email,
            financialYear,
            dateOfJoining: emp.dateOfJoining, // Added Date of Joining
            formData: rest,
            status
        };

        const existing = await InvestmentDeclaration.findOne({ employeeId: emp._id, financialYear });

        // If it exists and we're NOT in a situation where we're explicitly editing the same record
        // (Note: In this specific implementation, createOrUpdate handles both based on employeeId + year)
        // If the user is trying to "save" but a Submitted/Approved version exists, we should block it.
        if (existing && ['Submitted', 'Approved'].includes(existing.status)) {
            return res.status(400).json({ message: `A declaration for ${financialYear} has already been ${existing.status.toLowerCase()}. You cannot create another one.` });
        }

        let declaration;
        if (existing) {
            Object.assign(existing, payload);
            declaration = await existing.save();
        } else {
            declaration = new InvestmentDeclaration(payload);
            await declaration.save();
        }

        res.status(200).json({ message: 'Declaration saved', declaration });
    } catch (err) {
        console.error('createOrUpdateDeclaration error:', err);
        res.status(500).json({ message: err.message || 'Failed to save declaration' });
    }
};

export const submitDeclaration = async (req, res) => {
    try {
        const currentUser = req.user;
        // Allowed: employee, accountant, admin
        if (!hasRole(currentUser, ['employee', 'user', 'accountant', 'admin', 'superAdmin'])) {
            return res.status(403).json({ message: 'Not authorized to submit declaration' });
        }

        const { declarationId, employeeId } = req.body;
        if (!declarationId) return res.status(400).json({ message: 'declarationId required' });

        const dec = await InvestmentDeclaration.findById(declarationId);
        if (!dec) return res.status(404).json({ message: 'Declaration not found' });

        dec.status = 'Submitted';
        dec.submittedAt = new Date();
        await dec.save();

        res.status(200).json({ message: 'Declaration submitted', declaration: dec });
    } catch (err) {
        console.error('submitDeclaration error:', err);
        res.status(500).json({ message: err.message || 'Failed to submit declaration' });
    }
};

const groupDocumentsBySection = (documents) => {
    const grouped = {
        hraDocuments: [],
        ltaDocuments: [],
        section80CDocuments: [],
        section80CCDDocuments: [],
        section80DDocuments: [],
        housingLoanDocuments: [],
        declarationDocuments: [],
        tdsDocuments: [],
        otherSourcesDocuments: [],
        otherDocuments: []
    };

    if (!documents || !Array.isArray(documents)) return grouped;

    documents.forEach(doc => {
        const section = doc.section || 'otherDocuments';
        if (grouped[section]) {
            grouped[section].push(doc);
        } else {
            grouped.otherDocuments.push(doc);
        }
    });

    return grouped;
};

export const getDeclarationByEmployee = async (req, res) => {
    try {
        const currentUser = req.user;
        const { employeeId, financialYear } = req.query;

        if (!employeeId || !financialYear) return res.status(400).json({ message: 'employeeId & financialYear required' });

        // If not admin/accountant/superAdmin, ensure the employeeId belongs to the current user
        if (!hasRole(currentUser, ['admin', 'accountant', 'superAdmin'])) {
            // Map User to Employee via email and verify ID matches requested employeeId
            const employee = await Employee.findOne({ email: currentUser.userEmail });
            if (!employee || String(employee._id) !== String(employeeId)) {
                return res.status(403).json({ message: 'Not authorized to view this declaration' });
            }
        }

        const dec = await InvestmentDeclaration.findOne({ employeeId, financialYear }).populate('documents').lean();
        if (dec && dec.documents) {
            const groupedDocs = groupDocumentsBySection(dec.documents);
            Object.assign(dec, groupedDocs);
        }
        res.status(200).json({ declaration: dec || null });
    } catch (err) {
        console.error('getDeclarationByEmployee error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch declaration' });
    }
};

export const getDeclarationById = async (req, res) => {
    try {
        const currentUser = req.user;
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid ID' });

        const dec = await InvestmentDeclaration.findById(id).populate('documents').lean();
        if (!dec) return res.status(404).json({ message: 'Declaration not found' });

        // Only accountants/admins/superAdmin or the employee can view
        if (!hasRole(currentUser, ['accountant', 'admin', 'superAdmin'])) {
            const employee = await Employee.findOne({ email: currentUser.userEmail });
            if (!employee || String(employee._id) !== String(dec.employeeId)) {
                return res.status(403).json({ message: 'Not authorized to view this declaration' });
            }
        }

        if (dec.documents) {
            const groupedDocs = groupDocumentsBySection(dec.documents);
            Object.assign(dec, groupedDocs);
        }

        res.status(200).json({ declaration: dec });
    } catch (err) {
        console.error('getDeclarationById error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch declaration' });
    }
};

export const getAllDeclarations = async (req, res) => {
    try {
        const currentUser = req.user;
        const { financialYear, status, limit = 200 } = req.query;
        const filter = {};

        // If not accountant/superAdmin, force filter by current user's employee ID
        if (!hasRole(currentUser, ['accountant', 'superAdmin'])) {
            const employee = await Employee.findOne({ email: currentUser.userEmail });
            if (!employee) {
                // Return empty if no linked employee record found for this user
                return res.status(200).json({ declarations: [] });
            }
            filter.employeeId = employee._id;
        }

        if (financialYear) filter.financialYear = financialYear;
        if (status) filter.status = status;

        const declarations = await InvestmentDeclaration.find(filter).populate('documents').limit(parseInt(limit)).lean();

        const processedDeclarations = declarations.map(dec => {
            if (dec.documents) {
                const groupedDocs = groupDocumentsBySection(dec.documents);
                return { ...dec, ...groupedDocs };
            }
            return dec;
        });

        res.status(200).json({ declarations: processedDeclarations });
    } catch (err) {
        console.error('getAllDeclarations error:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch declarations' });
    }
};

export const updateInvestmentDeclarationStatus = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!hasRole(currentUser, ['accountant', 'superAdmin'])) {
            return res.status(403).json({ message: 'Not authorized to update status' });
        }

        const { declarationId, status, rejectionReason } = req.body;
        if (!declarationId || !status) {
            return res.status(400).json({ message: 'declarationId and status are required' });
        }

        if (!['Approved', 'Rejected', 'Submitted', 'Draft'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const dec = await InvestmentDeclaration.findById(declarationId);
        if (!dec) return res.status(404).json({ message: 'Declaration not found' });

        dec.status = status;
        if (status === 'Approved') {
            dec.approvedBy = currentUser._id;
            dec.approvedAt = new Date();
            dec.rejectionReason = undefined; // Clear any old reason
        } else if (status === 'Rejected') {
            dec.rejectedBy = currentUser._id;
            dec.rejectedAt = new Date();
            dec.rejectionReason = rejectionReason;
        }

        await dec.save();

        res.status(200).json({ message: `Declaration status updated to ${status}`, declaration: dec });
    } catch (err) {
        console.error('updateInvestmentDeclarationStatus error:', err);
        res.status(500).json({ message: err.message || 'Failed to update declaration status' });
    }
};

export const deleteDeclaration = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!hasRole(currentUser, ['accountant', 'admin', 'superAdmin'])) {
            return res.status(403).json({ message: 'Not authorized to delete' });
        }

        const { declarationId } = req.params;
        if (!declarationId || !mongoose.Types.ObjectId.isValid(declarationId)) return res.status(400).json({ message: 'Invalid declaration ID' });

        const dec = await InvestmentDeclaration.findByIdAndDelete(declarationId);
        if (!dec) return res.status(404).json({ message: 'Declaration not found' });

        res.status(200).json({ message: 'Declaration deleted' });
    } catch (err) {
        console.error('deleteDeclaration error:', err);
        res.status(500).json({ message: err.message || 'Failed to delete declaration' });
    }
};

export const uploadDocumentGridFS = async (req, res) => {
    try {
        const currentUser = req.user;
        const { declarationId } = req.params;
        const section = req.body.section || req.query.section || 'documents';

        if (!declarationId || !mongoose.Types.ObjectId.isValid(declarationId)) return res.status(400).json({ message: 'Invalid declaration ID' });
        const dec = await InvestmentDeclaration.findById(declarationId);
        if (!dec) return res.status(404).json({ message: 'Declaration not found' });

        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const bucket = getGridFSBucket();
        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        const uploadStream = bucket.openUploadStream(req.file.originalname, {
            contentType: req.file.mimetype,
            metadata: {
                declarationId,
                section,
                uploadedBy: currentUser._id
            }
        });

        readableStream.pipe(uploadStream);

        uploadStream.on('error', (err) => {
            console.error('GridFS Upload Error:', err);
            return res.status(500).json({ message: 'Upload failed' });
        });

        uploadStream.on('finish', async () => {
            const investUpload = new InvestUpload({
                filename: req.file.originalname,
                fileType: req.file.mimetype,
                size: req.file.size,
                gridFsId: uploadStream.id,
                uploadedBy: currentUser._id,
                section,
                declarationId
            });

            await investUpload.save();

            dec.documents.push(investUpload._id);
            await dec.save();

            res.status(201).json({ message: 'Uploaded and saved to GridFS', document: investUpload });
        });
    } catch (err) {
        console.error('uploadDocumentGridFS error:', err);
        res.status(500).json({ message: err.message || 'Failed to upload document' });
    }
};

export const downloadDocument = async (req, res) => {
    try {
        const { uploadId } = req.params;
        const upload = await InvestUpload.findById(uploadId);
        if (!upload) return res.status(404).json({ message: 'File not found' });

        const bucket = getGridFSBucket();
        res.set('Content-Type', upload.fileType);
        res.set('Content-Disposition', `attachment; filename="${upload.filename}"`);

        const downloadStream = bucket.openDownloadStream(upload.gridFsId);
        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error('Download Error:', err);
            res.status(404).json({ message: 'File not found in storage' });
        });
    } catch (err) {
        console.error('downloadDocument error:', err);
        res.status(500).json({ message: 'Download failed' });
    }
};

export const previewDocument = async (req, res) => {
    try {
        const { uploadId } = req.params;
        const upload = await InvestUpload.findById(uploadId);
        if (!upload) return res.status(404).json({ message: 'File not found' });

        const bucket = getGridFSBucket();
        res.set('Content-Type', upload.fileType);
        // No attachment disposition means browser will try to preview

        const downloadStream = bucket.openDownloadStream(upload.gridFsId);
        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error('Preview Error:', err);
            res.status(404).json({ message: 'File not found in storage' });
        });
    } catch (err) {
        console.error('previewDocument error:', err);
        res.status(500).json({ message: 'Preview failed' });
    }
};
