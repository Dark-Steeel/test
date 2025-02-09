// Gestion des modales
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const openLoginBtn = document.getElementById('open-login');
const goToSignupLink = document.getElementById('go-to-signup');
const closeLoginBtn = document.getElementById('close-login');
const closeSignupBtn = document.getElementById('close-signup');
const openSignupLink = document.getElementById('create-account'); // Le bouton/lien qui ouvre la modale

// Ouvrir la modale de connexion
if (openLoginBtn) {
  openLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
  });
}

// Ouvrir la modale de création de compte depuis la connexion
if (goToSignupLink) {
  goToSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none'; // Ferme la modale de connexion
    signupModal.style.display = 'flex'; // Ouvre la modale de création de compte
  });
}

// Ouvrir la modale de création de compte depuis le lien principal
if (openSignupLink) {
  openSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.style.display = 'flex';
  });
}

// Fermer les modales
if (closeLoginBtn) {
  closeLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });
}
if (closeSignupBtn) {
  closeSignupBtn.addEventListener('click', () => {
    signupModal.style.display = 'none';
  });
}

// Fermer la modale si on clique en dehors
window.addEventListener('click', (e) => {
  if (e.target === signupModal) {
    signupModal.style.display = 'none';
  }
});
