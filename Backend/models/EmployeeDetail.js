import mongoose from 'mongoose';

const EmployeeDetailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    employeeDetailId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    maritalStatus: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    currentAddress: {
        type: String,
        required: true
    },
    permanentAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true,
    },
    dateOfJoining: {
        type: Date,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    nameAsPerBank: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    panNumber: {
        type: String,
        required: true
    },
    aadharNumber: {
        type: String,
        required: true
    },
    uanNumber: {
        type: String,
        required: true
    },
    salary: {
        type: String
    },
    emergencyContactName: {
        type: String,
        required: true
    },
    emergencyContactRelation: {
        type: String,
        required: true
    },
    emergencyContactPhone: {
        type: Number,
        required: true
    },
    documentsPanCard: {
        url:String,
        publicId:String,
        originalName:String,
        format:String,
      
    },
    documentsAadhar: {
        url: String,
        publicId: String,
        originalName:String,
        format:String,
    },
    documentsDegree: {
        url:String,
        publicId:String,
        originalName:String,
        format:String,
    },
    documentsExperience: {
        url:String,
        publicId:String,
        originalName:String,
        format:String,
    }

});
export default EmployeeDetailSchema;
