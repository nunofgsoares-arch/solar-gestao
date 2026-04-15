async function init() {
  loadDash();
  loadRanking();
  loadAlertas();
}

async function loadDash() {
  const d = await fetch("/dashboard").then(r => r.json());

  dash.innerHTML = `
    <div>Horas: ${d.horas}</div>
    <div>kWp: ${d.kwp}</div>
    <div>Prod: ${d.produtividade.toFixed(2)}</div>
  `;
}

async function loadRanking() {
  const d = await fetch("/ranking-equipas").then(r => r.json());

  ranking.innerHTML = d.map(e =>
    `<div>${e.equipa} - ${e.produtividade.toFixed(2)} h/kWp</div>`
  ).join("");
}

async function loadAlertas() {
  const d = await fetch("/alertas-atraso").then(r => r.json());

  alertas.innerHTML = d.map(a =>
    `<div>${a.obra} ${a.atraso ? "⚠ atraso" : "OK"}</div>`
  ).join("");
}

async function registar() {
  await fetch("/registos", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      obra_id: obra.value,
      horas: Number(horas.value),
      data: new Date().toISOString()
    })
  });

  loadDash();
  loadRanking();
  loadAlertas();
}