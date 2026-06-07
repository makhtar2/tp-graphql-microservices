const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// SERVICE ÉTUDIANTS (Port 3002)
// Responsabilité : Gérer les données des étudiants (CRUD : Créer, Lire, Mettre
// à jour, Supprimer). Ce service est "aveugle" à l'authentification : il fait
// entièrement confiance à la Gateway GraphQL qui filtre les accès en amont.
// ============================================================================

const PORT = 3002;

// ----------------------------------------------------------------------------
// 1. BASE DE DONNÉES SIMULÉE (Mémoire Vive)
// ----------------------------------------------------------------------------
// Pour ce TP, nous stockons les étudiants directement dans un tableau mémoire.
// Cela simule le comportement d'une base de données relationnelle comme MySQL
// ou NoSQL comme MongoDB.
let students = [
  { id: '1', matricule: 'MAT2026001', nom: 'Wade', prenom: 'Makhtar', email: 'makhtar.wade@ucak.edu.sn', filiere: 'DAR', niveau: 'L3' },
  { id: '3', matricule: 'MAT2026003', nom: 'Seck', prenom: 'Makane', email: 'makane.seck@ucak.edu.sn', filiere: 'ASR', niveau: 'L3' },
  { id: '4', matricule: 'MAT2026004', nom: 'Lo', prenom: 'Amy', email: 'amy.lo@ucak.edu.sn', filiere: 'DAR', niveau: 'L3' }
];

let nextId = 5;

// ----------------------------------------------------------------------------
// 2. ROUTES REST
// ----------------------------------------------------------------------------

// Obtenir la liste complète des étudiants
app.get('/students', (req, res) => {
  res.json(students);
});

// Rechercher des étudiants (Moteur de recherche simple)
// Fonctionnement : On vérifie si la chaîne recherchée est incluse dans 
// le prénom, nom, email ou matricule (insensible à la casse).
app.get('/students/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json(students);
  }
  const lowerQ = q.toLowerCase();
  const results = students.filter(
    s => s.prenom.toLowerCase().includes(lowerQ) || 
         s.nom.toLowerCase().includes(lowerQ) || 
         s.email.toLowerCase().includes(lowerQ) ||
         s.matricule.toLowerCase().includes(lowerQ)
  );
  res.json(results);
});

// Récupérer un étudiant spécifique par son ID
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === req.params.id);
  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ message: 'Étudiant introuvable' });
  }
});

// Créer un nouvel étudiant
app.post('/students', (req, res) => {
  const { prenom, nom, email, matricule, filiere, niveau } = req.body;
  
  // Validation minimale : on s'assure que les champs obligatoires sont là
  if (!prenom || !nom || !email || !matricule) {
    return res.status(400).json({ message: 'Les champs prénom, nom, email et matricule sont obligatoires' });
  }
  
  const newStudent = { id: String(nextId++), prenom, nom, email, matricule, filiere: filiere || 'Non défini', niveau: niveau || 'Non défini' };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// Mettre à jour (remplacer) les informations d'un étudiant
app.put('/students/:id', (req, res) => {
  const { prenom, nom, email, matricule, filiere, niveau } = req.body;
  const index = students.findIndex(s => s.id === req.params.id);
  
  if (index !== -1) {
    // On conserve l'ID existant, et on écrase les autres valeurs
    students[index] = { ...students[index], prenom, nom, email, matricule, filiere, niveau };
    res.json(students[index]);
  } else {
    res.status(404).json({ message: 'Étudiant introuvable' });
  }
});

// Supprimer un étudiant
app.delete('/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === req.params.id);
  
  if (index !== -1) {
    const deletedStudent = students.splice(index, 1)[0];
    res.json(deletedStudent);
  } else {
    res.status(404).json({ message: 'Étudiant introuvable' });
  }
});

// Suppression par lot (Batch Delete)
// Très utile pour l'administration (ex: suppression de plusieurs étudiants sélectionnés)
app.post('/students/delete', (req, res) => {
  const { ids } = req.body; 
  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: 'Le paramètre ids doit être un tableau (array)' });
  }
  const initialCount = students.length;
  // On filtre le tableau pour ne garder que ceux dont l'ID N'EST PAS dans la liste
  students = students.filter(s => !ids.includes(s.id));
  
  const deletedCount = initialCount - students.length;
  res.json({ message: `${deletedCount} étudiants supprimés`, deletedCount });
});

app.listen(PORT, () => {
  console.log(`Student Service is running on http://localhost:${PORT}`);
});
