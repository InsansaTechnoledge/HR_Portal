import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const AttachmentSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    publicId: String,
    originalName: String,
    format: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

const AssigneeSchema = new mongoose.Schema({
    assigneeType: {
        type: String,
        enum: ['User', 'Employee'],
        required: true
    },
    assigneeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'assignedTo.assigneeType'
    },
    assigneeName: String,
    assigneeEmail: String
});

const TaskSchema = new mongoose.Schema({
    taskId: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    assignedTo: [AssigneeSchema],
    assignedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userName: String,
        userEmail: String
    },
    dueDate: {
        type: Date
    },
    completedDate: {
        type: Date
    },
    tags: [{
        type: String,
        trim: true
    }],
    attachments: [AttachmentSchema],
    comments: [CommentSchema]
}, {
    timestamps: true
});

// Indexes for efficient queries
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ 'assignedTo.assigneeId': 1 });
TaskSchema.index({ 'assignedBy.userId': 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdAt: -1 });

// Auto-increment taskId
TaskSchema.plugin(mongooseSequence(mongoose), { inc_field: 'taskId' });

const Task = mongoose.model('Task', TaskSchema);

export default Task;
