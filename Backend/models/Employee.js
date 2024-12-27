import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence'
import LeaveSchema from './Leave.js';
import EmployeeDetailSchema from './EmployeeDetail.js';
 
const EmployeeSchema = new mongoose.Schema({
    empId: {
        type: Number,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    leaveHistory: [LeaveSchema],
    totalLeaveBalance: {
        vacation: {
            type: Number,
            default: 20
        },
        sickLeave: {
            type: Number,
            default: 10
        },
        personalLeave: {
            type: Number,
            default: 5
        }
    },
    details: {
        type: EmployeeDetailSchema
    }
}, {
    timestamps: true
});

EmployeeSchema.plugin(mongooseSequence(mongoose), { inc_field: 'empId' });

const Employee = mongoose.model("Employee", EmployeeSchema);
export default Employee;
