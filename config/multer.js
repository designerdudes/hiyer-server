
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the media directory exists
const mediaDir = path.join(__dirname, '../media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Sanitize filename function
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Configure storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaDir); // Set the destination for uploaded files
  },
  filename: function (req, file, cb) {
    const sanitizedFilename = sanitizeFilename(file.originalname);
    cb(null, Date.now() + '-' + sanitizedFilename); // Use the current timestamp as part of the filename
  }
});

// Initialize multer with the storage options
export const upload = multer({ storage });
