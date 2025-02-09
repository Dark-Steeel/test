require('dotenv').config();

// Vérification des variables d'environnement
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID || "Non défini");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET || "Non défini");
console.log("FACEBOOK_APP_ID:", process.env.FACEBOOK_APP_ID || "Non défini");
console.log("FACEBOOK_APP_SECRET:", process.env.FACEBOOK_APP_SECRET || "Non défini");

const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();

// Connexion à MongoDB
const DB_URI = 'mongodb://localhost:27017/vigameurs';
mongoose.connect(DB_URI)
    .then(() => console.log('✅ MongoDB connecté avec succès 🚀'))
    .catch((err) => console.error('❌ Erreur de connexion à MongoDB :', err));

// Sessions
app.use(session({
    secret: 'vigameurs-secret-key',
    resave: false,
    saveUninitialized: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Uploads
const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// OAuth Strategies
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
    }, (accessToken, refreshToken, profile, done) => {
        done(null, profile);
    }));
} else {
    console.error("❌ Google OAuth n'est pas configuré. Vérifiez vos variables d'environnement.");
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
    }, (accessToken, refreshToken, profile, done) => {
        done(null, profile);
    }));
} else {
    console.error("❌ Facebook OAuth n'est pas configuré. Vérifiez vos variables d'environnement.");
}

// Routes
app.get('/api/auth/login', (req, res) => {
    res.status(200).json({ message: 'Route login accessible !' });
});

app.get('/', (req, res) => {
    console.log('Headers reçus :', req.headers);
    console.log('Route GET / appelée');
    res.send("Bienvenue sur le serveur Vigameurs !");
});

// Route pour la suppression des données
app.get('/delete-data', (req, res) => {
    const filePath = path.join(__dirname, 'delete-data.html');
    console.log('Chemin du fichier :', filePath);
    res.sendFile(filePath);
});

// Route POST pour login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email === "gamerx@email.com" && password === "monmotdepasse") {
        res.status(200).json({ message: "Connexion réussie !" });
    } else {
        res.status(401).json({ message: "Identifiants invalides" });
    }
});

// Route POST pour créer un utilisateur
app.post('/api/users', (req, res) => {
    try {
        console.log('Requête reçue :', req.body);
        res.status(201).send('Utilisateur créé');
    } catch (error) {
        console.error('Erreur lors du traitement :', error.message);
        res.status(500).send('Erreur interne du serveur');
    }
});

// Routes pour Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/profile'); // Redirection après succès
});

// Routes pour Facebook
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/profile'); // Redirection après succès
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
