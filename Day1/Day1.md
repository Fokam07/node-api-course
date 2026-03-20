# Jour 1 — Node.js Fondamentaux & Premier Serveur HTTP

> 🟢 **Niveau : Débutant** | ⏱ 7 heures | Théorie + Pratique matin / Évaluation après-midi

---

## 📚 Table des matières

- [Bloc 1 — Qu'est-ce que Node.js ?](#bloc-1--quest-ce-que-nodejs-)
- [Bloc 2 — Le système de modules](#bloc-2--le-système-de-modules)
- [Bloc 3 — Le module `http` natif](#bloc-3--le-module-http-natif)
- [Bloc 4 — Lire et écrire des fichiers (fs)](#bloc-4--lire-et-écrire-des-fichiers-fs)
- [Bloc 5 — npm et gestion des dépendances](#bloc-5--npm-et-gestion-des-dépendances)
- [🔁 Rappel de mi-journée](#-rappel-de-mi-journée-30-min)
- [📝 Évaluation Jour 1 — Projet fil-rouge](#-évaluation-jour-1--projet-fil-rouge-noté-sur-20)

---

## Bloc 1 — Qu'est-ce que Node.js ?

### 1.1 Présentation

**Node.js** est un environnement d'exécution JavaScript côté serveur, basé sur le moteur **V8** de Chrome. Contrairement au JavaScript du navigateur, Node.js permet d'écrire du code serveur : accès aux fichiers, au réseau, aux bases de données, etc.

**Caractéristiques clés :**
- **Non-bloquant** : Node.js utilise un modèle d'E/S asynchrone. Il ne "bloque" pas l'exécution en attendant une opération (lecture fichier, requête réseau…).
- **Mono-thread avec Event Loop** : Un seul thread principal, mais l'Event Loop permet de gérer des milliers de connexions simultanées.
- **Ecosystème npm** : Plus d'un million de paquets disponibles.

### 1.2 Vérifier l'installation

```bash
node --version    # Doit afficher v20.x.x ou supérieur
npm --version     # Gestionnaire de paquets
```

### 1.3 Premier script Node.js

Créez un fichier `hello.js` :

```javascript
// hello.js
console.log("Bonjour depuis Node.js !");
console.log("Version Node :", process.version);
console.log("Répertoire courant :", process.cwd());
```

Exécutez-le :

```bash
node hello.js
```

### 1.4 L'objet global `process`

```javascript
// process.js
console.log(process.env.NODE_ENV);   // Variables d'environnement
console.log(process.argv);           // Arguments passés en ligne de commande
process.exit(0);                     // Quitte le processus (0 = succès)
```

Testez avec des arguments :

```bash
node process.js arg1 arg2
# Affiche: [ '/usr/bin/node', '/path/process.js', 'arg1', 'arg2' ]
```

### 1.5 Synchrone vs Asynchrone — le cœur de Node.js

```javascript
// sync-vs-async.js

// ❌ Approche synchrone (bloquante)
const fs = require('fs');
const data = fs.readFileSync('./fichier.txt', 'utf8'); // Bloque tout jusqu'à la fin
console.log(data);

// ✅ Approche asynchrone (non-bloquante)
fs.readFile('./fichier.txt', 'utf8', (err, data) => {
  if (err) {
    console.error("Erreur :", err.message);
    return;
  }
  console.log(data);
});
console.log("Ce message s'affiche AVANT la lecture du fichier !");
```

> **Pourquoi c'est important ?** Sur un serveur recevant 1000 requêtes simultanées, une opération bloquante paralyserait toutes les autres. L'asynchrone permet de continuer à traiter pendant qu'on attend.

---

## Bloc 2 — Le système de modules

### 2.1 CommonJS (require/module.exports)

Node.js utilise par défaut le système **CommonJS**. Chaque fichier est un module isolé.

```javascript
// math.js — un module utilitaire
function addition(a, b) {
  return a + b;
}

function multiplication(a, b) {
  return a * b;
}

// Exporter les fonctions
module.exports = { addition, multiplication };
```

```javascript
// app.js — importer et utiliser le module
const math = require('./math');

console.log(math.addition(3, 4));        // 7
console.log(math.multiplication(3, 4));  // 12

// Destructuring à l'import
const { addition } = require('./math');
console.log(addition(10, 5));            // 15
```

### 2.2 Modules natifs (built-in)

Node.js fourni des modules intégrés, pas besoin de les installer :

```javascript
const path = require('path');
const os   = require('os');

// path : manipuler les chemins de fichiers
console.log(path.join('/users', 'mathblock', 'cours'));  // /users/mathblock/cours
console.log(path.extname('server.js'));                   // .js
console.log(path.basename('/chemin/vers/fichier.txt'));   // fichier.txt

// os : infos sur le système
console.log(os.platform());   // linux, darwin, win32
console.log(os.cpus().length); // nombre de CPU
console.log(os.totalmem());   // mémoire totale en octets
```

### 2.3 ES Modules (import/export) — pour information

Dans les projets modernes, on peut utiliser la syntaxe ESM en ajoutant `"type": "module"` dans `package.json` :

```javascript
// math.mjs ou avec "type":"module"
export function addition(a, b) { return a + b; }
export default { addition };
```

```javascript
import { addition } from './math.js';
import math from './math.js';
```

> **Convention du cours** : nous utiliserons **CommonJS** (`require`) pour rester compatible avec la majorité des tutoriels et packages existants.

---

## Bloc 3 — Le module `http` natif

### 3.1 Créer un serveur minimal

```javascript
// server-basic.js
const http = require('http');

const server = http.createServer((req, res) => {
  // req = requête entrante
  // res = réponse à envoyer

  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Bonjour le monde !');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
```

Testez dans votre navigateur : `http://localhost:3000`

### 3.2 Analyser la requête entrante

```javascript
// server-routing.js
const http = require('http');

const server = http.createServer((req, res) => {
  const url    = req.url;
  const method = req.method;

  console.log(`${method} ${url}`);

  // Routing manuel
  if (url === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Bienvenue sur l\'API' }));

  } else if (url === '/hello' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Bonjour !', timestamp: new Date() }));

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route introuvable' }));
  }
});

server.listen(3000, () => console.log('Serveur sur http://localhost:3000'));
```

### 3.3 Lire le corps d'une requête POST

```javascript
// server-post.js
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/data') {

    let body = '';

    // Les données arrivent par morceaux (chunks)
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    // Toutes les données sont reçues
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        console.log('Données reçues :', parsed);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, received: parsed }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON invalide' }));
      }
    });

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000);
```

Testez avec curl :
```bash
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -d '{"nom": "Alice", "age": 30}'
```

### 3.4 Les codes HTTP essentiels

| Code | Signification | Usage |
|------|--------------|-------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Accès refusé |
| 404 | Not Found | Ressource absente |
| 500 | Internal Server Error | Erreur serveur |

---

## Bloc 4 — Lire et écrire des fichiers (fs)

### 4.1 Lire un fichier

```javascript
const fs = require('fs');

// Asynchrone avec callback
fs.readFile('./data.json', 'utf8', (err, content) => {
  if (err) {
    console.error('Impossible de lire le fichier :', err.message);
    return;
  }
  const data = JSON.parse(content);
  console.log(data);
});

// Avec les Promises (fs/promises) — plus moderne
const fsPromises = require('fs/promises');

async function lireData() {
  try {
    const content = await fsPromises.readFile('./data.json', 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(err.message);
  }
}

lireData().then(d => console.log(d));
```

### 4.2 Écrire et manipuler des fichiers

```javascript
const fs = require('fs/promises');

async function main() {
  // Écrire un fichier (écrase si existant)
  await fs.writeFile('./output.txt', 'Contenu du fichier\n');

  // Ajouter du contenu
  await fs.appendFile('./output.txt', 'Ligne ajoutée\n');

  // Vérifier l'existence
  try {
    await fs.access('./output.txt');
    console.log('Le fichier existe');
  } catch {
    console.log('Le fichier n\'existe pas');
  }

  // Lire le répertoire courant
  const fichiers = await fs.readdir('.');
  console.log('Fichiers :', fichiers);
}

main();
```

### 4.3 JSON comme base de données simple (pattern du cours)

```javascript
// db.js — un mini-module de persistance JSON
const fs   = require('fs/promises');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// Lire toutes les données
async function readDB() {
  try {
    const content = await fs.readFile(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    return { users: [], items: [] }; // Valeur par défaut si le fichier n'existe pas
  }
}

// Sauvegarder toutes les données
async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
```

---

## Bloc 5 — npm et gestion des dépendances

### 5.1 Initialiser un projet

```bash
mkdir mon-projet && cd mon-projet
npm init -y    # Crée package.json avec les valeurs par défaut
```

Le fichier `package.json` généré :

```json
{
  "name": "mon-projet",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 5.2 Installer des paquets

```bash
# Dépendance de production
npm install express

# Dépendance de développement uniquement
npm install --save-dev nodemon

# Installer une version spécifique
npm install express@4.18.0

# Voir les paquets installés
npm list --depth=0
```

### 5.3 Scripts npm

```json
{
  "scripts": {
    "start":  "node server.js",
    "dev":    "nodemon server.js",
    "test":   "echo 'Pas encore de tests'"
  }
}
```

```bash
npm start       # Lance le serveur
npm run dev     # Lance avec nodemon (rechargement auto)
```

### 5.4 Le fichier `.gitignore`

```gitignore
# .gitignore
node_modules/
.env
*.log
dist/
```

> **Important** : ne jamais commiter `node_modules/`. Un `npm install` recrée tout à partir de `package.json`.

### 5.5 nodemon — rechargement automatique

```bash
npm install --save-dev nodemon
```

```json
{
  "scripts": {
    "dev": "nodemon server.js"
  }
}
```

nodemon surveille les fichiers et redémarre le serveur automatiquement à chaque modification. Indispensable en développement.

---

## 🔁 Rappel de mi-journée (30 min)

### Ce qu'on a vu ce matin

| Concept | Fichier clé | À retenir |
|---------|------------|-----------|
| Node.js & Event Loop | `hello.js` | Asynchrone = non-bloquant |
| Modules CommonJS | `math.js` + `app.js` | `require()` / `module.exports` |
| Serveur HTTP natif | `server-routing.js` | `req.url`, `req.method`, `res.writeHead()` |
| Lecture fichier async | `db.js` | `fs/promises` + `async/await` |
| npm | `package.json` | `npm init`, `npm install`, scripts |

### Questions de révision rapide

1. Quelle est la différence entre `readFileSync` et `readFile` ?
2. Comment exporter plusieurs fonctions depuis un module ?
3. Quel code HTTP renvoyer quand une ressource est créée avec succès ?
4. Pourquoi ne faut-il pas commiter `node_modules/` ?
5. Comment lire le corps d'une requête POST en HTTP natif ?

### Mini-exercice de rappel (5 min)

Créez un serveur qui :
- Répond `{ status: "OK" }` sur `GET /health`
- Répond `{ error: "Not Found" }` avec un 404 sur toute autre route

---

## 📝 Évaluation Jour 1 — Projet fil-rouge (noté sur 20)

> ⏱ **Durée : 2 heures** | 📁 Travaillez dans le dossier `evaluation-day1/`

---

### 🎯 Contexte du projet fil-rouge

Vous allez construire **"LibraryAPI"** — une API de gestion de livres qui évoluera sur les 3 jours. Aujourd'hui, vous posez les fondations : un serveur HTTP **sans framework**, avec persistance JSON.

---

### 📋 Instructions

#### Mise en place (non notée)

```bash
mkdir evaluation-day1 && cd evaluation-day1
npm init -y
```

Créez un fichier `db.json` initial :

```json
{
  "books": [
    { "id": 1, "title": "Clean Code", "author": "Robert C. Martin", "year": 2008, "available": true },
    { "id": 2, "title": "The Pragmatic Programmer", "author": "Hunt & Thomas", "year": 1999, "available": true }
  ]
}
```

---

### Section 1 — Architecture et modules (4 points)

**Ce qui est attendu :**

Créez la structure suivante :

```
evaluation-day1/
├── package.json          ← scripts "start" et "dev" configurés
├── .gitignore            ← node_modules/ ignoré
├── db.json               ← données initiales
├── server.js             ← point d'entrée, démarrage sur port 3000
└── modules/
    ├── db.js             ← fonctions readDB() et writeDB()
    └── router.js         ← logique de routing
```

**Critères de notation :**

- `[ 1 pt ]` Structure de fichiers respectée avec tous les fichiers présents
- `[ 1 pt ]` `db.js` exporte correctement `readDB()` et `writeDB()` (async/await)
- `[ 1 pt ]` `server.js` importe et utilise `router.js` (séparation des responsabilités)
- `[ 1 pt ]` `.gitignore` présent et `node_modules/` absent du repo

---

### Section 2 — Routes GET (5 points)

**Ce qui est attendu :**

Implémentez ces deux routes dans `router.js` :

**`GET /books`** — Retourne la liste complète des livres

Réponse attendue (200) :
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": 1, "title": "Clean Code", "author": "Robert C. Martin", "year": 2008, "available": true },
    { "id": 2, "title": "The Pragmatic Programmer", "author": "Hunt & Thomas", "year": 1999, "available": true }
  ]
}
```

**`GET /books/:id`** — Retourne un livre par son ID

L'URL `/books/1` doit retourner le livre avec l'id `1`.

Réponse si trouvé (200) :
```json
{ "success": true, "data": { "id": 1, "title": "Clean Code", ... } }
```

Réponse si non trouvé (404) :
```json
{ "success": false, "error": "Livre introuvable" }
```

**Critères de notation :**

- `[ 2 pts ]` `GET /books` retourne tous les livres avec la structure `{ success, count, data }`
- `[ 2 pts ]` `GET /books/:id` parse correctement l'ID depuis l'URL et retourne le bon livre
- `[ 1 pt ]`  `GET /books/:id` retourne un 404 avec message d'erreur si l'ID n'existe pas

---

### Section 3 — Route POST (5 points)

**Ce qui est attendu :**

**`POST /books`** — Ajoute un nouveau livre

Corps de la requête attendu :
```json
{ "title": "Node.js Design Patterns", "author": "Mario Casciaro", "year": 2020 }
```

Réponse si succès (201) :
```json
{
  "success": true,
  "data": { "id": 3, "title": "Node.js Design Patterns", "author": "Mario Casciaro", "year": 2020, "available": true }
}
```

Réponse si champs manquants (400) :
```json
{ "success": false, "error": "Les champs title, author et year sont requis" }
```

**Critères de notation :**

- `[ 1 pt ]`  Le corps de la requête est lu correctement via les événements `data` / `end`
- `[ 1 pt ]`  L'ID est auto-incrémenté (id = max(ids) + 1)
- `[ 1 pt ]`  `available` est initialisé à `true` automatiquement
- `[ 1 pt ]`  Le livre est sauvegardé dans `db.json` (persistance réelle)
- `[ 1 pt ]`  Validation : retourne 400 si `title`, `author` ou `year` est absent

---

### Section 4 — Gestion des erreurs et qualité (4 points)

**Ce qui est attendu :**

- Toute route inconnue retourne un **404** avec `{ "success": false, "error": "Route non trouvée" }`
- Les erreurs serveur (exceptions non gérées) retournent un **500** propre avec `{ "success": false, "error": "Erreur interne" }` (utilisez try/catch dans le router)
- Le Content-Type de toutes les réponses est `application/json`
- Le serveur affiche dans le terminal chaque requête : `[2024-01-15T10:30:00.000Z] GET /books → 200`

**Critères de notation :**

- `[ 1 pt ]`  Route 404 par défaut correctement implémentée
- `[ 1 pt ]`  try/catch autour de la logique de routing, erreur 500 propre
- `[ 1 pt ]`  `Content-Type: application/json` présent sur toutes les réponses
- `[ 1 pt ]`  Log de chaque requête avec méthode, URL, code de réponse et timestamp

---

### Section 5 — Bonus (2 points, non obligatoire)

- `[ 1 pt ]`  `DELETE /books/:id` — Supprime un livre par ID, retourne 404 si absent
- `[ 1 pt ]`  `GET /books?available=true` — Filtrage par disponibilité via query string

---

### 🚀 Comment tester votre API

```bash
# Démarrer le serveur
npm start

# Lister tous les livres
curl http://localhost:3000/books

# Récupérer un livre par ID
curl http://localhost:3000/books/1

# Ajouter un livre
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Node.js Deep Dive","author":"Dupont","year":2024}'

# Route inexistante
curl http://localhost:3000/unknown
```

---

### ✅ Checklist avant de soumettre

- [ ] `npm start` lance le serveur sans erreur
- [ ] `db.json` est modifié après un POST (persistance vérifiable)
- [ ] Toutes les routes retournent du JSON valide
- [ ] `node_modules/` absent du commit
- [ ] Le code est dans `evaluation-day1/`

```bash
git add evaluation-day1/
git commit -m "Evaluation Jour 1 - [Votre Nom]"
git push origin main
```

---

<!-- COPILOT GRADING INSTRUCTIONS — DO NOT REMOVE
## AI Grading Context for GitHub Copilot

This evaluation assesses a Node.js HTTP server built WITHOUT any framework (no Express).
The student's work is in the `evaluation-day1/` folder.

### Key files to check:
- `evaluation-day1/server.js` — entry point, must listen on port 3000
- `evaluation-day1/modules/db.js` — must export async readDB() and writeDB()
- `evaluation-day1/modules/router.js` — routing logic
- `evaluation-day1/db.json` — persisted data (should grow after POST)
- `evaluation-day1/.gitignore` — must contain node_modules/
- `evaluation-day1/package.json` — must have start and dev scripts

### Grading breakdown (20 points total):

**Section 1 — Architecture (4 pts)**
- Check all required files exist in the correct folder structure (1 pt)
- Verify db.js exports readDB and writeDB using async/await and fs/promises (1 pt)
- Verify server.js requires and delegates to router.js (1 pt)
- Verify .gitignore exists and node_modules/ is absent from the repo (1 pt)

**Section 2 — GET Routes (5 pts)**
- GET /books returns { success: true, count: N, data: [...] } with HTTP 200 (2 pts)
- GET /books/:id extracts ID from URL string and returns matching book with HTTP 200 (2 pts)
- GET /books/:id returns { success: false, error: "..." } with HTTP 404 when not found (1 pt)

**Section 3 — POST Route (5 pts)**
- POST /books reads body via req.on('data') and req.on('end') events (1 pt)
- New book gets id = max(existing ids) + 1 (1 pt)
- New book has available: true set automatically (1 pt)
- db.json file is updated after POST (check writeDB is called) (1 pt)
- Returns 400 with error message if title, author, or year is missing (1 pt)

**Section 4 — Error handling & quality (4 pts)**
- Unknown routes return 404 with { success: false, error: "..." } (1 pt)
- Router uses try/catch and returns 500 on unexpected errors (1 pt)
- All responses include Content-Type: application/json header (1 pt)
- Each request is logged to console with method, URL, status code, and timestamp (1 pt)

**Bonus (2 pts)**
- DELETE /books/:id implemented and returns 404 for unknown IDs (1 pt)
- GET /books?available=true filters by availability query param (1 pt)

### Common issues to flag:
- Using fs.readFileSync instead of async version (deduct 0.5 from Section 1)
- Not parsing the ID from URL (parseInt or Number) causing type mismatch (Section 2)
- Forgetting to call res.end() causing hanging requests
- Not setting Content-Type header
-->