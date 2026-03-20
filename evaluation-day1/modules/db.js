const fs = require ('fs');
const path = require('path');

const DB_path = path.join(__dirname, '../db.json');

async function readDB() {
    try {
        const data = await fs.promises.readFile(DB_path, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Erreur lors de la lecture du fichier DB:", err);
        throw err;
    }
}

async function writeDB(data) {
    try {
        await fs.promises.writeFile(DB_path, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("Erreur lors de l'écriture du fichier DB:", err);
        throw err;
    }   
}

module.exports = {
    readDB,
    writeDB
};