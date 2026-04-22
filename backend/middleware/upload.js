import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ✅ backend/uploads/ ka sahi path
// __dirname = backend/middleware/
// .. = backend/
// uploads = backend/uploads/
const uploadDir = path.join(__dirname, '..', 'uploads');

console.log('📁 Upload directory:', uploadDir); // ← Verify karne ke liye

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = ['.xlsx', '.xls', '.csv'];
  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('❌ only Excel (.xlsx, .xls) or CSV (.csv) are allowed '), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;