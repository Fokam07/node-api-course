const { readDB, writeDB } = require("./db");

async function router(req, res) {
  const { method, url } = req;

  res.setHeader("Content-Type", "application/json");

  try {

    if (method === "GET" && url === "/") {
    res.writeHead(200);
    return res.end(JSON.stringify({
     success: true,
     message: "Bienvenue sur LibraryAPI"
     }));
   }
   
    if (method === "GET" && url === "/books") {
      const db = await readDB();

      res.writeHead(200);
      return res.end(JSON.stringify({
        success: true,
        count: db.books.length,
        data: db.books
      }));
    }
    
    if (method === "GET" && url.startsWith("/books/")) {
      const id = parseInt(url.split("/")[2]);
      const db = await readDB();

      const book = db.books.find(b => b.id === id);

      if (!book) {
        res.writeHead(404);
        return res.end(JSON.stringify({
          success: false,
          error: "Livre introuvable"
        }));
      }

      res.writeHead(200);
      return res.end(JSON.stringify({
        success: true,
        data: book
      }));
    }

    if (method === "POST" && url === "/books") {
      let body = "";

      req.on("data", chunk => {
        body += chunk;
      });

      req.on("end", async () => {
        const { title, author, year } = JSON.parse(body);

        if (!title || !author || !year) {
          res.writeHead(400);
          return res.end(JSON.stringify({
            success: false,
            error: "Les champs title, author et year sont requis"
          }));
        }

        const db = await readDB();

        const newId =
          db.books.length > 0
            ? Math.max(...db.books.map(b => b.id)) + 1
            : 1;

        const newBook = {
          id: newId,
          title,
          author,
          year,
          available: true
        };

        db.books.push(newBook);
        await writeDB(db);

        res.writeHead(201);
        return res.end(JSON.stringify({
          success: true,
          data: newBook
        }));
      });

      return;
    }

   
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      error: "Route non trouvée"
    }));

    if (method === "DELETE" && url.startsWith("/books/")) {
      const id = parseInt(url.split("/")[2]);
      const db = await readDB();

      const bookIndex = db.books.findIndex(b => b.id === id);

      if (bookIndex === -1) {
        res.writeHead(404);
        return res.end(JSON.stringify({
          success: false,
          error: "Livre introuvable"
        }));
      }

      db.books.splice(bookIndex, 1);
      await writeDB(db);

      res.writeHead(200);
      return res.end(JSON.stringify({
        success: true,
        message: "Livre supprimé avec succès"
      }));
    }

  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: "Erreur interne"
    }));
  }
}

module.exports = router;