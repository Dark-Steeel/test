console.log("Le fichier server.js est bien exécuté !");

console.log("Le serveur est en cours de démarrage...");

console.log("Le serveur démarre...");

console.log("Début de l'exécution du serveur");

// Import des modules nécessaires
const mongoose = require('mongoose');
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

console.log("Le fichier server.js est en cours d'exécution...");

// Initialisation d'Express
const app = express();

// Connexion à MongoDB
const DB_URI = "mongodb://localhost:27017/vigameurs";

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connecté avec succès 🚀"))
  .catch((err) => console.error("❌ Erreur de connexion à MongoDB :", err));

// Configuration des sessions
app.use(
  session({
    secret: "vigameurs-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Gestion des fichiers uploadés
const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sérialisation des utilisateurs
const users = [];
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user || false);
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "GOOGLE_CLIENT_ID",
      clientSecret: "GOOGLE_CLIENT_SECRET",
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      let user = users.find((u) => u.id === profile.id);
      if (!user) {
        user = {
          id: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
        };
        users.push(user);
      }
      done(null, user);
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: "FACEBOOK_APP_ID",
      clientSecret: "FACEBOOK_APP_SECRET",
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      let user = users.find((u) => u.id === profile.id);
      if (!user) {
        user = {
          id: profile.id,
          username: profile.displayName,
          email: profile.emails ? profile.emails[0].value : "Non défini",
          avatar: profile.photos[0].value,
        };
        users.push(user);
      }
      done(null, user);
    }
  )
);

// Routes d'authentification
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/login.html" }), (req, res) => {
  res.redirect("/profile.html");
});

app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login.html" }), (req, res) => {
  res.redirect("/profile.html");
});

// API pour les profils
app.get("/api/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  res.json(req.user);
});

app.put("/api/profile", upload.single("avatar"), (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Non authentifié" });
  }
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }
  user.username = req.body.username || user.username;
  user.bio = req.body.bio || user.bio;
  if (req.file) {
    user.avatar = `/uploads/${req.file.filename}`;
  }
  res.json(user);
});

// Route pour la politique de confidentialité
app.get("/privacy-policy", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "privacy-policy.html"));
});

// Route principale
app.get("/", (req, res) => {
  res.send("le Serveur fonctionne !");
});

// Lancement du serveur
console.log("Le fichier server.js est en cours d'exécution...");
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
