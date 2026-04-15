const express = require("express");
const db = require("./db");
const webpush = require("web-push");

const app = express();
app.use(express.json());
app.use(express.static("public"));

webpush.setVapidDetails(
  "mailto:admin@solar.com",
  "CHAVE_PUBLICA",
  "CHAVE_PRIVADA"
);

/* DASHBOARD */
app.get("/dashboard", (req, res) => {
  db.get(`
    SELECT 
      IFNULL(SUM(r.horas),0) as horas,
      IFNULL(SUM(o.kwp),0) as kwp,
      COUNT(o.id) as obras
    FROM obras o
    LEFT JOIN registos r ON r.obra_id = o.id
  `, [], (e, row) => {

    const produtividade = row.kwp ? row.horas / row.kwp : 0;

    res.send({ ...row, produtividade });
  });
});

/* REGISTOS */
app.post("/registos", (req, res) => {
  db.run(`
    INSERT INTO registos (obra_id, horas, data)
    VALUES (?,?,?)
  `, [req.body.obra_id, req.body.horas, req.body.data]);

  res.send({ ok: true });
});

/* EQUIPAS */
app.post("/equipas", (req, res) => {
  db.run(`INSERT INTO equipas (nome) VALUES (?)`, [req.body.nome]);
  res.send({ ok: true });
});

app.get("/equipas", (req, res) => {
  db.all(`SELECT * FROM equipas`, [], (e, r) => res.send(r));
});

/* RANKING */
app.get("/ranking-equipas", (req, res) => {

  db.all(`
    SELECT 
      eq.nome as equipa,
      IFNULL(SUM(r.horas),0) as horas,
      IFNULL(SUM(o.kwp),0) as kwp,
      CASE WHEN SUM(o.kwp)>0
      THEN SUM(r.horas)/SUM(o.kwp)
      ELSE 0 END as produtividade
    FROM equipas eq
    LEFT JOIN obras o ON o.equipa_id = eq.id
    LEFT JOIN registos r ON r.obra_id = o.id
    GROUP BY eq.id
    ORDER BY produtividade ASC
  `, [], (e, r) => res.send(r));
});

/* PREVISÃO */
app.get("/previsao-obra/:obra/:equipa", (req, res) => {

  db.get(`SELECT kwp FROM obras WHERE id=?`, [req.params.obra], (e, o) => {

    db.get(`
      SELECT IFNULL(SUM(r.horas)/SUM(o.kwp),2) as media
      FROM obras o
      LEFT JOIN registos r ON r.obra_id = o.id
      WHERE o.equipa_id=?
    `, [req.params.equipa], (e2, eq) => {

      const media = eq?.media || 2;

      res.send({
        previsao: o.kwp * media
      });

    });

  });

});

/* ALERTAS */
app.get("/alertas-atraso", (req, res) => {

  db.all(`
    SELECT 
      o.nome,
      o.kwp,
      eq.nome as equipa,
      IFNULL(SUM(r.horas),0) as horas
    FROM obras o
    LEFT JOIN equipas eq ON eq.id = o.equipa_id
    LEFT JOIN registos r ON r.obra_id = o.id
    GROUP BY o.id
  `, [], (e, rows) => {

    const result = rows.map(o => {
      const esperado = o.kwp * 2;

      return {
        obra: o.nome,
        equipa: o.equipa,
        horas_reais: o.horas,
        horas_esperadas: esperado,
        atraso: o.horas > esperado
      };
    });

    res.send(result);
  });

});

/* PUSH */
app.post("/subscribe", (req, res) => {
  const s = req.body;

  db.run(`
    INSERT INTO subscriptions (endpoint,p256dh,auth)
    VALUES (?,?,?)
  `, [s.endpoint, s.keys.p256dh, s.keys.auth]);

  res.send({ ok: true });
});

app.listen(3000, () => console.log("http://localhost:3000"));