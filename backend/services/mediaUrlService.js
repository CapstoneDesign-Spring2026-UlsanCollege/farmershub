function buildMediaUrl(req, relativePath) {
    if (!relativePath) return '';
    if (/^https?:\/\//i.test(relativePath)) return relativePath;
    return `${req.protocol}://${req.get('host')}${relativePath}`;
}

module.exports = {
    buildMediaUrl,
};