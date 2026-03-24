require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const LivresRepository = require('./repositories/livresRespository');
const prisma = require('./database/prisma');
const { livreCreateSchema, livreUpdateSchema } = require('./validators/livreValidator');
const validate = require('./middleware/validate');

// Sample route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/bibliotheque', async (req, res) => {
   try {
    const livres = await LivresRepository.livres;
    res.json(livres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/bibliotheque/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const livre = await LivresRepository.livre;
        if (!livre) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }
        res.json(livre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/bibliotheque', validate(livreCreateSchema), async (req, res) => {
    const { titre, auteur, annee , genre, disponible } = req.body;
    try {
        const nouveauLivre = await LivresRepository.nouveau;
        res.status(201).json(nouveauLivre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.put('/bibliotheque/:id', validate(livreUpdateSchema), async (req, res) => {
    const id = parseInt(req.params.id);
    try {        const livre = await prisma.livre.findUnique({ where: { id } });
        if (!livre) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }     const modifieLivre = await LivresRepository.modifie;
        res.json(modifieLivre);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.delete('/bibliotheque/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const livre = await prisma.livre.findUnique({ where: { id } });
        if (!livre) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }
        await prisma.livre.delete({ where: { id } });
        res.json({ message: 'Livre supprimé' });
    }
        catch (error) { 
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

