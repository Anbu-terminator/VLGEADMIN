require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET, // Use secret from .env file
    resave: false,
    saveUninitialized: true,
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { // Use URI from .env file
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Failed to connect to MongoDB:', err));

// Schema and Model
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model('user', userSchema); // Collection name is 'user'

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email and password
        const user = await User.findOne({ email, password });
        if (user) {
            req.session.user = user; // Set session
            res.redirect('/page1');
        } else {
            res.send("Invalid email or password. Please try again.");
        }
    } catch (error) {
        console.log(error);
        res.send("An error occurred. Please try again.");
    }
});

app.get('/page1', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'page1.html'));
    } else {
        res.redirect('/');
    }
});

// Listen on port from .env file or default 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
