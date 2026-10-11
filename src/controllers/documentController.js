
import {
  uploadDocumentService,
  getDocumentById,
  downloadDocumentService,
  deleteDocumentService,
} from "../services/documentService.js";

// Upload a document
export const uploadDocument = async (req, res) => {
  try {
    const document = await uploadDocumentService(
      req.user.id,
      req.file
    );

    return res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    if (
      [
        "FILE_REQUIRED",
        "INVALID_FILE_TYPE",
        "INVALID_PDF",
      ].includes(error.message)
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Document upload failed:", error.message);

    return res.status(500).json({
      message: "Document upload failed",
    });
  }
};

// Get metadata for one document
export const getDocument = async (req, res) => {
  try {
    const document = await getDocumentById(
      req.params.id,
      req.user.id
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    return res.status(200).json({ document });
  } catch (error) {
    console.error("Get document failed:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve document",
    });
  }
};

// Download the actual PDF
export const downloadDocument = async (req, res) => {
  try {
    const result = await downloadDocumentService(
      req.params.id,
      req.user.id
    );

    if (!result) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const safeFilename = result.originalFilename
      .replace(/[\r\n"\\/]/g, "_");

    res.setHeader("Content-Type", result.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename}"`
    );
    res.setHeader("Content-Length", result.buffer.length);

    return res.status(200).send(result.buffer);
  } catch (error) {
    console.error("Document download failed:", error.message);

    if (error.message === "DOCUMENT_DOWNLOAD_FAILED") {
      return res.status(502).json({
        message: "Unable to retrieve document from storage",
      });
    }

    return res.status(500).json({
      message: "Document download failed",
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const deleted = await deleteDocumentService(
      req.params.id,
      req.user.id
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    return res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Document deletion failed:", error.message);

    if (error.message === "STORAGE_DELETE_FAILED") {
      return res.status(502).json({
        message: "Unable to delete document from storage",
      });
    }

    return res.status(500).json({
      message: "Document deletion failed",
    });
  }
};
