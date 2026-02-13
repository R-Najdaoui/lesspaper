# Teacher Portal - Instructions

## Prérequis

- Node.js (v14+)
- Python (v3.8+)

## Installation et Lancement

### 1. Backend (FastAPI)

Ouvrez un terminal dans le dossier `profweb`.

```bash
cd backend
# (Optionnel) Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn main:app --reload
```

Le serveur backend tournera sur `http://localhost:8000`.

### 2. Frontend (React + Vite)

Ouvrez un **nouveau** terminal dans le dossier `profweb`.

```bash
# Installer les dépendances (si ce n'est pas déjà fait)
npm install react-router-dom

# Lancer le serveur de développement
npm run dev
```

Ouvrez votre navigateur sur l'URL indiquée (généralement `http://localhost:5173`).

### 3. Utilisation

1. **Inscription** : Sur la page de connexion, cliquez sur "Créer un compte". Entrez un nom d'utilisateur et un mot de passe.
2. **Connexion** : Connectez-vous avec vos identifiants.
3. **Tableau de bord** : Vous verrez la liste de vos examens.
4. **Créer un examen** : Cliquez sur le bouton "+" pour créer un examen.
5. **Ajouter des questions** : Une fois l'examen créé, cliquez sur "Modifier / Questions" pour ajouter des QCM, questions courtes ou code.
6. **Code Examen** : Le code à 6 caractères affiché (ex: `ABC123`) est celui que les étudiants devront entrer dans leur application Python.
7. **Résultats** : Cliquez sur "Résultats" pour voir les soumissions des étudiants et les exporter en Excel.

## Notes Techniques

- Les soumissions de code sont stockées en texte brut.
- La base de données est `teacher_portal.db` (SQLite) dans le dossier `backend`.
