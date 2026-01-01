import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const PayslipSchema = new mongoose.Schema({
  payslipId: {
    type: Number, // Auto-incremented field for Payslip ID
  },
  employeeId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  month: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  hra: {
    type: Number,
    default: 0, // House Rent Allowance
  },
  conveyanceAllowance: {
    type: Number,
    default: 0,
  },
  medicalAllowance: {
    type: Number,
    default: 0,
  },
  specialAllowance: {
    type: Number,
    default: 0,
  },
  professionalTax: {
    type: Number,
    default: 0,
  },
  TDS: {
    type: Number,
    default: 0,
  },
  incomeTax: {
    type: Number,
    default: 0,
  },

  totalEarnings: {
    type: Number,
    required: true,
  },
  totalDeductions: {
    type: Number,
    required: true,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  bankAccount: {
    type: String,
    required: true,
    trim: true,
  },
  panNumber: {
    type: String,
    required: true,
    trim: true,
  },
  uanNumber: {
    type: String,
    trim: true,
  },
  generatedBy: {
    type: String,
    required: true,
  },
  taxType: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    enum: ["classic", "modern", "minimal", "corporate", "default"],
    default: "classic",
    required: true,
  },
});

// Indexes for common lookups
PayslipSchema.index({ employeeId: 1 });
PayslipSchema.index({ month: 1 });

// Auto-increment plugin for payslipId
PayslipSchema.plugin(mongooseSequence(mongoose), { inc_field: "payslipId" });

// Export the Payslip model
const Payslip = mongoose.model("Payslip", PayslipSchema);
export default Payslip;
