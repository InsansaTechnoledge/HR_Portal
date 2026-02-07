import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientType'
    },
    recipientType: {
        type: String,
        required: true,
        enum: ['User', 'Employee']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderType'
    },
    senderType: {
        type: String,
        enum: ['User', 'Employee']
    },
    type: {
        type: String,
        required: true,
        enum: ['LEAVE_APPLIED', 'LEAVE_STATUS_UPDATE', 'GENERAL']
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
