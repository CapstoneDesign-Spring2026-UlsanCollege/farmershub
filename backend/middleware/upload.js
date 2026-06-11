const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const ROOT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const IMAGE_EXTENSIONS = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

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
        const ext = IMAGE_EXTENSIONS[file.mimetype];
        cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`);
    },
});

function fileFilter(req, file, cb) {
    if (!IMAGE_EXTENSIONS[file.mimetype]) {
        return cb(new Error('Only image uploads are allowed.'));
    }
    return cb(null, true);
}

const rawUploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

function detectImageMime(filePath) {
    const descriptor = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(12);

    try {
        fs.readSync(descriptor, header, 0, header.length, 0);
    } finally {
        fs.closeSync(descriptor);
    }

    if (header.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg';
    if (header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
    if (header.subarray(0, 6).toString('ascii') === 'GIF87a' || header.subarray(0, 6).toString('ascii') === 'GIF89a') {
        return 'image/gif';
    }
    if (header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP') {
        return 'image/webp';
    }
    return '';
}

function requestFiles(req) {
    if (req.file) return [req.file];
    if (Array.isArray(req.files)) return req.files;
    if (req.files && typeof req.files === 'object') return Object.values(req.files).flat();
    return [];
}

function removeFiles(files) {
    files.forEach((file) => {
        if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
}

function validateUploadedImages(req, res, next) {
    const files = requestFiles(req);

    try {
        const invalid = files.find((file) => detectImageMime(file.path) !== file.mimetype);
        if (!invalid) return next();

        removeFiles(files);
        const error = new Error('Uploaded file content does not match an allowed image type.');
        error.statusCode = 415;
        return next(error);
    } catch (error) {
        removeFiles(files);
        error.statusCode = error.statusCode || 400;
        return next(error);
    }
}

const uploader = {
    single: (...args) => [rawUploader.single(...args), validateUploadedImages],
    array: (...args) => [rawUploader.array(...args), validateUploadedImages],
    fields: (...args) => [rawUploader.fields(...args), validateUploadedImages],
};

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
