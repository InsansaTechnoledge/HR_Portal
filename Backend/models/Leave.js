import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Vacation', 'Sick Leave', 'Personal', 'Maternity', 'Unpaid Leave'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    statusUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusUpdatedAt: {
        type: Date
    },
    remarks: {
        type: String
    },
    reason: {
        type: String
    }
});

export default LeaveSchema;
