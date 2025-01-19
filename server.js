const express = require("express");
const passport = require("passport");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const app = express();

// Configurer le dossier pour les uploads
const upload = multer({ dest: "uploads/" });

// Simule une base de données
const users = [];

// Configurer les sessions
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
app.use(express.static(path.join(__dirname, "public")));

// Sérialisation des utilisateurs
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

// Routes pour l'authentification
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html" }),
  (req, res) => {
    res.redirect("/profile.html");
  }
);

app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login.html" }),
  (req, res) => {
    res.redirect("/profile.html");
  }
);

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

// Servir les fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
