const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // Vérification des mots de passe
  if (password !== confirmPassword) {
    alert('Les mots de passe ne correspondent pas.');
    return;
  }

  // Envoi des données au serveur
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Compte créé avec succès !');
      window.location.href = 'login.html';
    } else {
      alert(data.message || 'Erreur lors de la création du compte.');
    }
  } catch (error) {
    console.error('Erreur :', error);
    alert('Impossible de créer le compte. Veuillez réessayer plus tard.');
  }
});
