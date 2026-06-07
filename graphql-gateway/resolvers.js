// Axios agit comme notre "client HTTP" interne. 
// Il permet à notre Gateway GraphQL de communiquer avec les autres microservices.
const axios = require('axios');

// Adresses internes de nos microservices (ils pourraient être sur d'autres serveurs)
const AUTH_URL = 'http://localhost:3001';
const STUDENT_URL = 'http://localhost:3002/students';

// =========================================================================
// MIDDLEWARE DE SÉCURITÉ
// =========================================================================
// Cette fonction est appelée avant chaque action sensible.
// Elle vérifie si l'utilisateur a été identifié par la Gateway (dans index.js).
const checkAuth = (context) => {
  if (!context.user) {
    throw new Error('Non Autorisé : Vous devez être connecté pour effectuer cette action');
  }
};

const resolvers = {
  Query: {
    students: async (_, __, context) => {
      checkAuth(context);
      const response = await axios.get(STUDENT_URL);
      return response.data;
    },
    student: async (_, { id }, context) => {
      checkAuth(context);
      try {
        const response = await axios.get(`${STUDENT_URL}/${id}`);
        return response.data;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          return null;
        }
        throw new Error('Error fetching student');
      }
    },
    searchStudents: async (_, { q }, context) => {
      checkAuth(context);
      const response = await axios.get(`${STUDENT_URL}/search?q=${encodeURIComponent(q)}`);
      return response.data;
    }
  },
  Mutation: {
    login: async (_, { username, password }) => {
      try {
        const response = await axios.post(`${AUTH_URL}/login`, { username, password });
        return { token: response.data.token };
      } catch (err) {
        throw new Error('Invalid credentials');
      }
    },
    addStudent: async (_, args, context) => {
      checkAuth(context);
      const response = await axios.post(STUDENT_URL, args);
      return response.data;
    },
    updateStudent: async (_, { id, prenom, nom, email, matricule, filiere, niveau }, context) => {
      checkAuth(context);
      try {
        const response = await axios.put(`${STUDENT_URL}/${id}`, { prenom, nom, email, matricule, filiere, niveau });
        return response.data;
      } catch (err) {
        throw new Error('Error updating student');
      }
    },
    deleteStudent: async (_, { id }, context) => {
      checkAuth(context);
      try {
        const response = await axios.delete(`${STUDENT_URL}/${id}`);
        return response.data;
      } catch (err) {
        throw new Error('Error deleting student');
      }
    },
    deleteStudents: async (_, { ids }, context) => {
      checkAuth(context);
      const response = await axios.post(`${STUDENT_URL}/delete`, { ids });
      return response.data;
    }
  }
};

module.exports = resolvers;
