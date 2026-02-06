import mongoose from 'mongoose';



const InvestmentDeclarationSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeName: String,
    employeeCode: String,
    employeeEmail: String,
    financialYear: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], default: 'Draft' },
    formData: { type: mongoose.Schema.Types.Mixed },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InvestUpload' }],
    submittedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: String
}, {
    timestamps: true
});

InvestmentDeclarationSchema.index({ employeeId: 1, financialYear: 1 }, { unique: true });

const InvestmentDeclaration = mongoose.model('InvestmentDeclaration', InvestmentDeclarationSchema);

export default InvestmentDeclaration;
