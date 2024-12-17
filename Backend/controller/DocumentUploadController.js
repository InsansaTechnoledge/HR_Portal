import Document from "../models/DocumentUpload.js";

// Upload a document
export const uploadDocument = async (req, res) => {
  try {
    const { name, type, uploadedBy, employee, size } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    const newDocument = new Document({
      name,
      type,
      uploadedBy,
      employee,
      document: req.file.buffer,
      size,
    });

    await newDocument.save();

    res.status(201).json({ message: "Document uploaded successfully", data: newDocument });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Delete a document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByIdAndDelete(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Fetch all documents
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().select("-document");

    res.status(200).json({ data: documents });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

import Document from "../models/DocumentUpload.js";

// View a document
export const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the document by ID
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Set appropriate headers for the response
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${document.name}"`);

    // Send the file buffer
    res.send(document.document);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Download a document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the document by ID
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Set headers for file download
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${document.name}"`);

    // Send the file buffer
    res.send(document.document);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
