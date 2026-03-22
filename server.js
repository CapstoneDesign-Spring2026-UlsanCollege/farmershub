const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'FarmersHub API is running' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // TODO: Replace with real database lookup
    if (username === 'admin' && password === 'admin123') {
        return res.status(200).json({ success: true, message: 'Login successful', user: { username } });
    }

    return res.status(401).json({ success: false, message: 'Invalid username or password.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
