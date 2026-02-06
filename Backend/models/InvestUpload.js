import mongoose from 'mongoose';

const InvestUploadSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    gridFsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    section: {
        type: String,
        required: true
    },
    declarationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvestmentDeclaration',
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const InvestUpload = mongoose.model('InvestUpload', InvestUploadSchema);

export default InvestUpload;
