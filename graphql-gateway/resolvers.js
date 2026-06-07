const axios = require('axios');

const AUTH_URL = 'http://localhost:3001';
const STUDENT_URL = 'http://localhost:3002/students';

// Helper function to check auth
const checkAuth = (context) => {
  if (!context.user) {
    throw new Error('Unauthorized: You must be logged in to perform this action');
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
