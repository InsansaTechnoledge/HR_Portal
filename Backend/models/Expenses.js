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
    // Array of expense items with type and amount
    expenses: [
      {
        type: {
          type: String,
          required: true,
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

        location: {
          type: String,
          enum: ["National", "International"],
          required: true,
          default: "National",
        },

        currency: {
          type: String,
          required: true,
          default: "INR",
        },

        exchangeRate: {
          type: Number,
          required: true,
          min: 0,
          default: 1,
        },

        convertedAmount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    description: {
      type: String,
      trim: true,
    },

    // Total amount (calculated from expenses array)
    amount: {
      type: Number,
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
