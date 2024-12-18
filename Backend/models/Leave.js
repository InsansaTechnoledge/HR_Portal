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

// No need to create a model unless you're using `Leave` independently.
export default LeaveSchema;
