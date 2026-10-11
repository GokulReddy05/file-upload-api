
import { randomUUID } from "node:crypto";
import pool from "../config/db.js";
import supabase from "../config/supabase.js";

// Upload a document
export const uploadDocumentService = async (userId, file) => {
  if (!file) {
    throw new Error("FILE_REQUIRED");
  }

  if (file.mimetype !== "application/pdf") {
    throw new Error("INVALID_FILE_TYPE");
  }

  if (!file.buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new Error("INVALID_PDF");
  }

  const storageKey = `${userId}/${randomUUID()}.pdf`;

  const { error: storageError } = await supabase.storage
    .from("documents")
    .upload(storageKey, file.buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (storageError) {
    throw new Error("STORAGE_UPLOAD_FAILED");
  }

  try {
    const result = await pool.query(
      `INSERT INTO documents
        (owner_id, original_filename, storage_key, file_size, content_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, owner_id, original_filename, file_size,
                 content_type, status, created_at`,
      [
        userId,
        file.originalname,
        storageKey,
        file.size,
        "application/pdf",
      ]
    );

    return result.rows[0];
  } catch (error) {
    const { error: cleanupError } = await supabase.storage
      .from("documents")
      .remove([storageKey]);

    if (cleanupError) {
      console.error("Storage cleanup failed:", cleanupError.message);
    }

    throw error;
  }
};

// Get metadata for one document belonging to the user
export const getDocumentById = async (documentId, userId) => {
  const result = await pool.query(
    `SELECT id, original_filename, file_size,
            content_type, status, created_at
     FROM documents
     WHERE id = $1 AND owner_id = $2`,
    [documentId, userId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
};

// Download a document belonging to the user
export const downloadDocumentService = async (documentId, userId) => {
  // First, verify ownership and retrieve the internal storage key.
  const result = await pool.query(
    `SELECT id, original_filename, storage_key, content_type
     FROM documents
     WHERE id = $1 AND owner_id = $2`,
    [documentId, userId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const document = result.rows[0];

  // Retrieve the actual PDF from the private Supabase bucket.
  const { data, error } = await supabase.storage
    .from("documents")
    .download(document.storage_key);

  if (error || !data) {
    throw new Error("DOCUMENT_DOWNLOAD_FAILED");
  }

  // Convert the returned Blob into a Node.js Buffer.
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return {
    buffer,
    originalFilename: document.original_filename,
    contentType: document.content_type,
  };
};


export const deleteDocumentService = async (documentId, userId) => {
  // Step 1: Find the document and verify ownership.
  const result = await pool.query(
    `SELECT id, storage_key
     FROM documents
     WHERE id = $1 AND owner_id = $2`,
    [documentId, userId]
  );

  if (result.rowCount === 0) {
    return false;
  }

  const document = result.rows[0];

  // Step 2: Delete the actual file from Supabase Storage.
  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([document.storage_key]);

  if (storageError) {
    throw new Error("STORAGE_DELETE_FAILED");
  }

  // Step 3: Delete the metadata row from PostgreSQL.
  await pool.query(
    `DELETE FROM documents
     WHERE id = $1 AND owner_id = $2`,
    [documentId, userId]
  );

  return true;
};
