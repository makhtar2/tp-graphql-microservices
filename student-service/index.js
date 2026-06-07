const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3002;

// In-memory mock data
let students = [
  { id: '1', matricule: 'MAT2026001', nom: 'Wade', prenom: 'Makhtar', email: 'makhtar.wade@ucak.edu.sn', filiere: 'DAR', niveau: 'L3' },
  { id: '3', matricule: 'MAT2026003', nom: 'Seck', prenom: 'Makane', email: 'makane.seck@ucak.edu.sn', filiere: 'ASR', niveau: 'L3' },
  { id: '4', matricule: 'MAT2026004', nom: 'Lo', prenom: 'Amy', email: 'amy.lo@ucak.edu.sn', filiere: 'DAR', niveau: 'L3' }
];

let nextId = 5;

// Get all students
app.get('/students', (req, res) => {
  res.json(students);
});

// Search students
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

// Get a single student
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === req.params.id);
  if (student) {
    res.json(student);
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
});

// Add a student
app.post('/students', (req, res) => {
  const { prenom, nom, email, matricule, filiere, niveau } = req.body;
  if (!prenom || !nom || !email || !matricule) {
    return res.status(400).json({ message: 'Prenom, nom, email, and matricule are required' });
  }
  const newStudent = { id: String(nextId++), prenom, nom, email, matricule, filiere: filiere || 'Non défini', niveau: niveau || 'Non défini' };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

// Update a student
app.put('/students/:id', (req, res) => {
  const { prenom, nom, email, matricule, filiere, niveau } = req.body;
  const index = students.findIndex(s => s.id === req.params.id);
  
  if (index !== -1) {
    students[index] = { ...students[index], prenom, nom, email, matricule, filiere, niveau };
    res.json(students[index]);
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
});

// Delete a student
app.delete('/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === req.params.id);
  
  if (index !== -1) {
    const deletedStudent = students.splice(index, 1)[0];
    res.json(deletedStudent);
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
});

// Delete multiple students
app.post('/students/delete', (req, res) => {
  const { ids } = req.body; // array of string IDs
  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: 'IDs must be an array' });
  }
  const deletedCount = students.length;
  students = students.filter(s => !ids.includes(s.id));
  const count = deletedCount - students.length;
  res.json({ message: `${count} students deleted`, deletedCount: count });
});

app.listen(PORT, () => {
  console.log(`Student Service is running on http://localhost:${PORT}`);
});
