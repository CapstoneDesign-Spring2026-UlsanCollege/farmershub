const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ROOT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

ensureDir(ROOT_UPLOAD_DIR);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const segment = req.uploadFolder || 'misc';
        const target = path.join(ROOT_UPLOAD_DIR, segment);
        ensureDir(target);
        cb(null, target);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const safeBase = path.basename(file.originalname || 'upload', ext).replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
        cb(null, `${Date.now()}-${safeBase}${ext}`);
    },
});

function fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only image uploads are allowed.'));
    }
    return cb(null, true);
}

const uploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

function withUploadFolder(folder) {
    return (req, res, next) => {
        req.uploadFolder = folder;
        next();
    };
}

function toUploadPath(file) {
    if (!file) return '';
    const normalized = file.path.replace(/\\/g, '/');
    const marker = '/uploads/';
    const idx = normalized.lastIndexOf(marker);
    return idx >= 0 ? normalized.slice(idx) : `/uploads/${file.filename}`;
}

module.exports = {
    uploader,
    withUploadFolder,
    toUploadPath,
};