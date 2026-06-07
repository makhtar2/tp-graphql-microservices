// ============================================================================
// PASSERELLE (GATEWAY) GRAPHQL (Port 4000)
// Responsabilité : C'est la porte d'entrée unique de notre architecture.
// Elle intercepte les requêtes GraphQL, vérifie l'identité de l'utilisateur,
// et dispatche le travail vers les microservices concernés.
// ============================================================================

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Pour faire des requêtes HTTP vers nos autres services

const typeDefs = require('./schema');     // La carte de nos données (le "Quoi")
const resolvers = require('./resolvers'); // Le code qui va chercher les données (le "Comment")

const PORT = 4000;
// L'adresse du service d'authentification pour vérifier les tokens
const AUTH_URL = 'http://localhost:3001';

async function startServer() {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      // ----------------------------------------------------------------------
      // LE CONTEXTE : NOTRE FILTRE DE SÉCURITÉ GLOBAL
      // ----------------------------------------------------------------------
      // Cette fonction s'exécute à CHAQUE requête arrivant sur la Gateway.
      // Son but : Vérifier "Qui est là ?" avant même que les résolveurs ne travaillent.
      context: async ({ req }) => {
        // 1. Obtenir le token depuis l'en-tête (Header) "Authorization"
        const authHeader = req.headers.authorization || '';
        
        // 2. Nettoyer le format (enlever le mot "Bearer " laissé par Postman/Sandbox)
        const token = authHeader.replace('Bearer ', '').trim();

        // Si aucun token, on laisse passer, mais en tant que visiteur anonyme (user: null)
        if (!token) {
          return { user: null };
        }

        try {
          // 3. Demander au microservice d'Auth de vérifier l'authenticité de ce Token
          const response = await axios.post(`${AUTH_URL}/verify`, { token });
          
          if (response.data.valid) {
            // Si le token est valide, on attache l'utilisateur au Contexte.
            // Ainsi, nos résolveurs (dans resolvers.js) sauront qu'il est connecté.
            return { user: response.data.user };
          } 
        } catch (error) {
          // En cas d'erreur de réseau avec le service Auth ou de token invalide
          console.error("Échec de la validation du Token:", error.message);
        }
        
        return { user: null };
      },
    }),
  );

  app.listen(PORT, () => {
    console.log(`GraphQL Gateway is running on http://localhost:${PORT}/graphql`);
  });
}

startServer();
