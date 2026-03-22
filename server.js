const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'FarmersHub API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
