const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// SERVICE D'AUTHENTIFICATION (Port 3001)
// Responsabilité : Valider l'identité des administrateurs et délivrer/vérifier
// les passeports numériques (Tokens JWT).
// ============================================================================

const PORT = 3001;
// La clé secrète est le "sceau" de notre université. Elle sert à signer 
// cryptographiquement nos JWT pour prouver qu'ils ont été émis par nous.
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_tp';

// ----------------------------------------------------------------------------
// 1. BASE DE DONNÉES SIMULÉE (Administrateur)
// ----------------------------------------------------------------------------
// Pour éviter la complexité d'une vraie BDD, on garde un administrateur en mémoire.
// Le mot de passe ("admin123") est haché avec bcrypt pour respecter les bonnes 
// pratiques de sécurité, même en mémoire.
const adminUser = {
  id: 1,
  username: 'admin',
  passwordHash: bcrypt.hashSync('admin123', 10)
};

// ----------------------------------------------------------------------------
// 2. ROUTE : CONNEXION (/login)
// ----------------------------------------------------------------------------
// Cette route reçoit les identifiants depuis la Gateway GraphQL.
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Étape A : Vérifier si l'utilisateur existe et comparer le mot de passe haché
  if (username === adminUser.username && bcrypt.compareSync(password, adminUser.passwordHash)) {
    
    // Étape B : Si succès, on génère un Token JWT contenant l'ID et le rôle.
    // Ce token expirera automatiquement dans 2 heures.
    const token = jwt.sign({ id: adminUser.id, username: adminUser.username, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '2h' });
    
    return res.json({ token });
  }

  // Si échec, on renvoie une erreur "401 Non Autorisé"
  return res.status(401).json({ message: 'Identifiants incorrects' });
});

// ----------------------------------------------------------------------------
// 3. ROUTE : VÉRIFICATION DU TOKEN (/verify)
// ----------------------------------------------------------------------------
// Cette route est appelée par la Gateway GraphQL à CHAQUE requête sécurisée,
// pour s'assurer que le token fourni par le client est authentique et valide.
app.post('/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Aucun token fourni' });
  }

  try {
    // La méthode jwt.verify tente de décrypter la signature avec notre clé secrète.
    // Si le token a été modifié ou s'il est expiré, cette méthode plantera (catch).
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, message: 'Token invalide ou expiré' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Service is running on http://localhost:${PORT}`);
});
