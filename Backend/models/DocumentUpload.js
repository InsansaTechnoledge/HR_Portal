import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const AutoIncrement = mongooseSequence(mongoose);

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: Number,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    uploadDate: {
      type: Date,
      default: Date.now,
    },

    uploadedBy: {
      type: String,
      required: true,
    },

    employee: {
      type: String,
      required: true,
    },

    employeeEmail: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    size: {
      type: String,
    },

    status: {
      type: String,
      default: "Active",
    },
  },
  { timestamps: true }
);

documentSchema.plugin(AutoIncrement, { inc_field: "documentId" });

const Document = mongoose.model("Document", documentSchema);

export default Document;
