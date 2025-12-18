import Document from "../models/DocumentUpload.js";

// Upload a document
// export const uploadDocument = async (req, res) => {
//   try {
//     const { name, type, uploadedBy, employee, size } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ message: "Document file is required" });
//     }

//     const newDocument = new Document({
//       name,
//       type,
//       uploadedBy,
//       employee,
//       document: req.file.buffer,
//       size,
//     });

//     await newDocument.save();

//     res.status(201).json({ message: "Document uploaded successfully", data: newDocument });
//   } catch (err) {
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

export const uploadDocument = async (req, res) => {
  try {
    const { name, type, uploadedBy, employee, email, size } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    // multer-storage-cloudinary provides these
    const {
      originalname,
      path,        
      filename,    
      mimetype
    } = req.file;

    const newDocument = new Document({
      name: name || originalname,
      type: type || mimetype,
      uploadedBy,
      employee,
      employeeEmail: email,
      size,
      url: path,          
      publicId: filename, 
    });

    await newDocument.save();

    res.status(201).json({
      message: "Document uploaded successfully",
      data: newDocument,
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};


// Delete a document
// export const deleteDocument = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const document = await Document.findByIdAndDelete(id);

//     if (!document) {
//       return res.status(404).json({ message: "Document not found" });
//     }

//     res.status(200).json({ message: "Document deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }


    if (document.publicId) {
      await cloudinary.uploader.destroy(document.publicId, {
        resource_type: "raw", // IMPORTANT for PDFs/DOCs
      });
    }

    await Document.findByIdAndDelete(id);

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
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


// View a document
export const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Cloudinary preview
    return res.redirect(document.url);

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};



export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.set({
      "Content-Type": document.mimeType, // ✅ CRITICAL
      "Content-Disposition": `attachment; filename="${document.name}"`,
      "Content-Length": document.document.length
    });

    res.end(document.document); // ✅ binary-safe
  } catch (err) {
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};


