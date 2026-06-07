# Guide du Débutant : Projet GraphQL & Microservices

Bienvenue dans ce guide étape par étape ! Ce document a été conçu pour vous accompagner pas à pas dans la découverte, le lancement et le test de notre architecture Microservices avec GraphQL. Ne vous inquiétez pas si vous débutez, tout est expliqué en détail.

---

## 🛠️ Étape 1 : Comprendre ce que nous avons construit

Au lieu d'avoir une seule grosse application qui fait tout, nous l'avons découpée en **3 petits morceaux** (c'est ce qu'on appelle des microservices). Chacun a un rôle très précis :

1. **Le Service d'Authentification (Port 3001)** : Son seul travail est de vérifier que vous êtes bien l'administrateur et de vous donner un "badge d'accès" (un token JWT).
2. **Le Service des Étudiants (Port 3002)** : C'est lui qui gère la liste des étudiants (ajouter, modifier, supprimer).
3. **La Gateway GraphQL (Port 4000)** : C'est le chef d'orchestre ! Vous ne parlez qu'à lui. Il va vérifier votre "badge d'accès" (token) et transmettre vos demandes au Service des Étudiants.

---

## 🚀 Étape 2 : Démarrer les moteurs (Lancer les services)

Pour que l'application fonctionne, il faut allumer les 3 services en même temps.
Ouvrez **3 terminaux différents** dans VSCode (ou dans votre système) et tapez les commandes suivantes.

**Dans le Terminal 1 (pour allumer l'authentification) :**
```bash
cd "ucak-microservices-graphql/auth-service"
node index.js
```
*(Vous devriez voir : Auth Service is running on http://localhost:3001)*

**Dans le Terminal 2 (pour allumer la gestion des étudiants) :**
```bash
cd "ucak-microservices-graphql/student-service"
node index.js
```
*(Vous devriez voir : Student Service is running on http://localhost:3002)*

**Dans le Terminal 3 (pour allumer la passerelle GraphQL) :**
```bash
cd "ucak-microservices-graphql/graphql-gateway"
node index.js
```
*(Vous devriez voir : GraphQL Gateway is running on http://localhost:4000/graphql)*

---

## 🧪 Étape 3 : Tester l'application comme un pro

Maintenant que tout est allumé, ouvrez votre navigateur internet (Chrome, Firefox, Safari...) et allez à cette adresse :
👉 **http://localhost:4000/graphql**

Cela va ouvrir l'interface **Apollo Sandbox**, un outil visuel génial pour tester nos requêtes.

### Test A : Se connecter et obtenir son badge (Token)

Avant de demander la liste des étudiants, nous devons prouver qui nous sommes.
1. Dans le grand cadre du milieu (la zone de texte `Operation`), effacez tout ce qui s'y trouve et collez ceci :
   ```graphql
   mutation Login {
     login(username: "admin", password: "admin123") {
       token
     }
   }
   ```
2. Cliquez sur le gros bouton bleu **"Login"** (en haut à droite).
3. Dans le panneau de droite (la réponse), vous allez voir apparaître un texte très long. C'est votre token !
   **Sélectionnez et copiez ce long texte (sans les guillemets).**

### Test B : Présenter son badge (Configurer le Header)

Maintenant, nous devons dire à Apollo d'utiliser ce badge pour toutes nos prochaines requêtes.
1. Toujours dans Apollo Sandbox, regardez en bas à gauche. Vous verrez des onglets comme "Variables", "Headers", "Settings".
2. Cliquez sur l'onglet **"Headers"**.
3. Cliquez sur **"New Header"**.
4. Dans la case de gauche (Key), tapez : `Authorization`
5. Dans la case de droite (Value), tapez le mot `Bearer ` (avec un espace à la fin), suivi du token que vous avez copié juste avant.
   *Exemple :* `Bearer eyJhbGciOiJIUzI1...`

### Test C : Afficher la liste de tous les étudiants

Maintenant que nous sommes connectés, demandons la liste des étudiants.
1. Dans la grande zone de texte du milieu, effacez la mutation "Login" et collez ceci à la place :
   ```graphql
   query GetAllStudents {
     students {
       id
       prenom
       nom
       email
       matricule
       filiere
       niveau
     }
   }
   ```
2. Cliquez sur le bouton bleu **"GetAllStudents"**.
3. Magie ! 🎉 À droite, vous verrez apparaître la liste complète des étudiants avec leur prénom et nom.

### Test D : Ajouter un nouvel étudiant

Et si nous ajoutions "Charlie" à notre école ?
1. Effacez la requête précédente et collez celle-ci :
   ```graphql
   mutation AjouterEtudiant {
     addStudent(prenom: "Fatou", nom: "Sow", email: "fatou.sow@ucak.edu.sn", matricule: "MAT2026005", filiere: "Génie Logiciel", niveau: "M1") {
       id
       prenom
       nom
       email
     }
   }
   ```
2. Cliquez sur le bouton bleu **"AjouterEtudiant"**.
3. À droite, vous verrez que Fatou a bien été ajoutée ! 

### Test E : Mettre à jour un étudiant (Update)

Vous vous êtes trompé dans l'email de Fatou ? Corrigeons-le.
1. Collez cette requête :
   ```graphql
   mutation ModifierEtudiant {
     updateStudent(id: "5", prenom: "Fatou", nom: "Sow", email: "fatou.nouvel_email@ucak.edu.sn", matricule: "MAT2026005", filiere: "Génie Logiciel", niveau: "M1") {
       id
       email
     }
   }
   ```
2. Cliquez sur **"ModifierEtudiant"**. La réponse vous confirmera le nouvel email.

### Test F : Chercher un étudiant avec des "Variables" (Niveau avancé)

Nous voulons chercher spécifiquement l'étudiant "Makane".
1. Collez cette requête dans le panneau central :
   ```graphql
   query ChercherEtudiant($texteRecherche: String!) {
     searchStudents(q: $texteRecherche) {
       id
       prenom
       nom
       email
     }
   }
   ```
2. Cette fois, ne cliquez pas tout de suite sur le bouton bleu ! Regardez en bas à gauche, cliquez sur l'onglet **"Variables"**.
3. Dans la zone de texte des Variables, collez ceci :
   ```json
   {
     "texteRecherche": "Makane"
   }
   ```
4. Maintenant, cliquez sur le bouton bleu **"ChercherEtudiant"**.
5. À droite, seul Makane apparaîtra. Vous venez de réussir à passer un argument complexe avec GraphQL !

### Test G : Supprimer un étudiant

Fatou a fini ses études, supprimons son dossier.
1. Collez cette requête :
   ```graphql
   mutation SupprimerEtudiant {
     deleteStudent(id: "5") {
       id
       prenom
       nom
     }
   }
   ```
2. Cliquez sur **"SupprimerEtudiant"**. La réponse vous montrera les données de l'étudiant qui vient d'être supprimé.

---

## 🌟 Pourquoi on a fait tout ça ? (Pour votre présentation)

Si votre professeur vous demande pourquoi cette architecture est bien, voici les réponses :

* **Plus de données inutiles** : Remarquez qu'à chaque test, vous avez décidé exactement des informations que vous vouliez (id, name, email...). Si vous ne voulez pas le matricule, vous l'enlevez de la requête. GraphQL s'adapte à vous !
* **Un seul guichet** : Tout se passe sur `/graphql`. Dans une API traditionnelle, il aurait fallu connaître plein d'adresses (`/students`, `/students/add`, `/students/search`...).
* **Si un service tombe, le reste survit** : Notre architecture Microservices fait que si le "Auth Service" plante, le reste de notre code ne s'effondre pas instantanément, car ils sont séparés physiquement.
