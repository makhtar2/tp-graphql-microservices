const { gql } = require('graphql-tag'); // To parse the string

const typeDefs = `#graphql
  type Student {
    id: ID!
    prenom: String!
    nom: String!
    email: String!
    matricule: String!
    filiere: String
    niveau: String
  }

  type Admin {
    id: ID!
    username: String!
    role: String
  }

  type AuthPayload {
    token: String!
  }

  type DeleteResult {
    message: String!
    deletedCount: Int
  }

  type Query {
    # Public (no auth required in this TP, or auth required depending on requirements)
    # We will protect all student queries with Auth for demonstration
    students: [Student!]!
    student(id: ID!): Student
    searchStudents(q: String!): [Student!]!
  }

  type Mutation {
    # Auth
    login(username: String!, password: String!): AuthPayload!

    # Students (Protected)
    addStudent(prenom: String!, nom: String!, email: String!, matricule: String!, filiere: String, niveau: String): Student!
    updateStudent(id: ID!, prenom: String, nom: String, email: String, matricule: String, filiere: String, niveau: String): Student!
    deleteStudent(id: ID!): Student!
    deleteStudents(ids: [ID!]!): DeleteResult!
  }
`;

module.exports = typeDefs;
