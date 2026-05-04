const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = /jpeg|jpg|png|webp/;
const MAX_SIZE_MB = 5;

// Store files locally under uploads/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const isAllowed =
    ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase()) &&
    ALLOWED_TYPES.test(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and WEBP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = upload;
