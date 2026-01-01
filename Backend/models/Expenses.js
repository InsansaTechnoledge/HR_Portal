import mongoose from "mongoose";
import mongoosesequence from "mongoose-sequence";

const ExpenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: Number,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    expenseType: {
      type: String,
      enum: [
        "Travel",
        "Food",
        "Internet",
        "Medical",
        "Office Supplies",
        "Training",
        "Other",
      ],
      required: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expenseDate: {
      type: Date,
      required: true,
    },

    // Multiple receipt files 
    receipts: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    
    reimbursementMonth: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PAID"],
      default: "PENDING",
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ExpenseSchema.plugin(mongoosesequence(mongoose), { inc_field: "expenseId" });
export default mongoose.model("Expense", ExpenseSchema);
