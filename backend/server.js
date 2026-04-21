require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const postRoutes = require('./routes/posts');
const farmerRoutes = require('./routes/farmers');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmershub';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

const allowedOrigins = CLIENT_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === '*'
        ? '*'
        : allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'FarmersHub API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/farmers', farmerRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
