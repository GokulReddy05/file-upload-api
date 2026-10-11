
import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  uploadDocument,
  getDocument,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// Upload a PDF
router.post(
  "/upload",
  authenticateUser,
  upload.single("file"),
  uploadDocument
);

// Get document metadata
router.get(
  "/:id",
  authenticateUser,
  getDocument
);

// Download the actual PDF
router.get(
  "/:id/download",
  authenticateUser,
  downloadDocument
);

router.delete(
  "/:id",
  authenticateUser,
  deleteDocument
);

export default router;
