const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'FarmersHub API is running' });
});

// Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
