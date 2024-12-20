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
    }
});

export default LeaveSchema;
