const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const PORT = 4000;
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
      context: async ({ req }) => {
        // Obtenir le token depuis le header Authorization
        const authHeader = req.headers.authorization || '';
        console.log("Received authHeader:", authHeader);
        const token = authHeader.replace('Bearer ', '').trim();
        console.log("Extracted token:", token ? "Token present" : "No token");

        if (!token) {
          return { user: null };
        }

        try {
          // Appeler l'Auth Service pour valider le token
          const response = await axios.post(`${AUTH_URL}/verify`, { token });
          if (response.data.valid) {
            console.log("Token is valid!");
            return { user: response.data.user };
          } else {
            console.log("Token is invalid according to Auth Service");
          }
        } catch (error) {
          console.error("Token validation failed:", error.message);
          if (error.response) console.error("Response:", error.response.data);
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
