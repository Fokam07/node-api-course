
const router = require('express').Router();
const LivresRepository = require('../repositories/livresRespository');
const prisma = require('../database/prisma');

router.post('/', async (req, res) => {
    const {nom, prenom, email, password} = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return res.status(400).json({ error: 'Email incorrect' });
    }
    try {        const user = await prisma.user.create({
            data: { nom, prenom, email, password },
        });
        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });    
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        res.json({ message: 'Connexion réussie' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


router.post('/', async (req, res) => {
  const { titre, auteur, annee , genre, disponible } = req.body;
    try {   
    const nouveauLivre = await LivresRepository.nouveau;
    res.status(201).json(nouveauLivre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { titre, auteur, annee , genre, disponible } = req.body;
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

router.delete('/:id', async (req, res) => {
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

module.exports = Router;