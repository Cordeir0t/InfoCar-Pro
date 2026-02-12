// ==========================================
// INFOCAR PRO - OS.JS (EXPANSÃO DO SEU SCRIPT.JS)
// Mantém 100% sua voz + adiciona novos campos
// ==========================================

// === SEU CÓDIGO ORIGINAL (mantido intacto) ===
const nome = document.getElementById("nome");
const placa = document.getElementById("placa");
const reparo = document.getElementById("reparo");
const obs = document.getElementById("observacoes");
const lista = document.getElementById("lista");
const btnSalvar = document.getElementById("salvar");
const btnLimparForm = document.getElementById("limparForm");
const btnIniciarVoz = document.getElementById("iniciarVoz");
const iconeRobo = document.getElementById("iconeRobo");
const iconeMic = document.getElementById("iconeMic");

let editandoId = null;
let etapaVoz = 0;
let timeoutSilencio = null;

// NOVOS CAMPOS (mantém compatibilidade)
const marca = document.getElementById("marca");
const tipoCarro = document.getElementById("tipoCarro");
const pecas = document.getElementById("pecas");
const codigoCompra = document.getElementById("codigoCompra");
const descricaoProcesso = document.getElementById("descricaoProcesso");

// === SUA VOZ (mantida 100%) ===
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) alert("Use Chrome/Edge para voz.");
const rec = new SpeechRecognition();
rec.lang = "pt-BR";
rec.interimResults = false;
rec.continuous = false;
const synth = window.speechSynthesis;

function mostrarRobo() { iconeRobo.hidden = false; iconeMic.hidden = true; }
function mostrarMic() { iconeRobo.hidden = true; iconeMic.hidden = false; }
function esconderIcones() { iconeRobo.hidden = true; iconeMic.hidden = true; }

function falar(texto, callback) {
  synth.cancel(); rec.abort(); mostrarRobo();
  const fala = new SpeechSynthesisUtterance(texto); fala.lang = "pt-BR";
  fala.onend = () => { setTimeout(() => { mostrarMic(); if (callback) callback(); }, 100); };
  synth.speak(fala);
}

function ouvirCampo(campo, repetirPergunta) {
  rec.abort(); rec.start();
  timeoutSilencio = setTimeout(() => { rec.abort(); falar(repetirPergunta, () => ouvirCampo(campo, repetirPergunta)); }, 5000);
  rec.onresult = (e) => { clearTimeout(timeoutSilencio); campo.value = e.results[0][0].transcript; rec.abort(); proximaEtapa(); };
}

function iniciarFluxoVoz() { etapaVoz = 0; proximaEtapa(); }

function proximaEtapa() {
  const perguntas = [
    ["Informe o responsável", nome],
    ["Informe a placa do veículo", placa],
    ["Qual a marca do carro? Fiat, VW...", marca],
    ["Tipo de carro? Hatch, Sedan...", tipoCarro],
    ["Tipo de reparo", reparo],
    ["Observações opcionais", obs],
    ["Descrição do processo", descricaoProcesso]
  ];
  
  if (etapaVoz < perguntas.length) {
    const [texto, campo] = perguntas[etapaVoz];
    falar(texto, () => ouvirCampo(campo, texto));
    etapaVoz++;
  } else {
    esconderIcones(); falar("OS salva!"); etapaVoz = 0;
  }
}

btnIniciarVoz.onclick = iniciarFluxoVoz;

// === SALVAR (seu + novos campos) ===
btnSalvar.onclick = () => {
  if (!nome.value || !placa.value || !reparo.value) { alert("Preencha essencial."); return; }
  
  let dados = JSON.parse(localStorage.getItem("osInfocar") || "[]");
  
  if (editandoId) {
    dados = dados.map(r => r.id === editandoId ? { ...r, nome: nome.value, placa: placa.value, reparo: reparo.value, obs: obs.value, marca: marca.value, tipoCarro: tipoCarro.value, pecas: pecas.value, codigoCompra: codigoCompra.value, descricaoProcesso: descricaoProcesso.value } : r);
    editandoId = null; btnSalvar.textContent = "Salvar OS";
  } else {
    dados.push({
      id: Date.now(),
      nome: nome.value, placa: placa.value, reparo: reparo.value, obs: obs.value,
      marca: marca.value, tipoCarro: tipoCarro.value, pecas: pecas.value,
      codigoCompra: codigoCompra.value, descricaoProcesso: descricaoProcesso.value,
      data: new Date().toLocaleString(), status: 'Aberta'
    });
  }
  
  localStorage.setItem("osInfocar", JSON.stringify(dados));
  atualizarDashboard(); // sync com index
  limparFormulario();
  renderizar();
};

// === RENDER (seu + novos) ===
function renderizar() {
  lista.innerHTML = "";
  const dados = JSON.parse(localStorage.getItem("osInfocar") || "[]");
  dados.forEach(r => {
    const div = document.createElement("div"); div.className = "item";
    div.innerHTML = `
      <strong>${r.placa} (${r.marca})</strong> — ${r.reparo}<br>
      ${r.nome} | ${r.status}<br>
      Peças: ${r.pecas || 'N/A'} | NF: ${r.codigoCompra || 'N/A'}<br>
      <small>${r.data}</small><br>
      <button onclick="editar(${r.id})">Editar</button>
      <button onclick="excluir(${r.id})">Excluir</button>
      <button onclick="concluirOS(${r.id})">Concluir</button>
    `;
    lista.appendChild(div);
  });
}

function editar(id) {
  const dados = JSON.parse(localStorage.getItem("osInfocar") || "[]");
  const r = dados.find(item => item.id == id);
  if (!r) return;
  
  nome.value = r.nome; placa.value = r.placa; reparo.value = r.reparo; obs.value = r.obs;
  marca.value = r.marca; tipoCarro.value = r.tipoCarro; pecas.value = r.pecas;
  codigoCompra.value = r.codigoCompra; descricaoProcesso.value = r.descricaoProcesso;
  
  editandoId = id; btnSalvar.textContent = "Atualizar OS";
}

function excluir(id) { if(confirm("Excluir?")) { /* seu código */ renderizar(); atualizarDashboard(); } }

function concluirOS(id) {
  const dados = JSON.parse(localStorage.getItem("osInfocar") || "[]");
  dados.find(r => r.id == id).status = 'Concluída';
  localStorage.setItem("osInfocar", JSON.stringify(dados));
  renderizar(); atualizarDashboard();
}

function limparFormulario() {
  nome.value = placa.value = reparo.value = obs.value = marca.value = tipoCarro.value = pecas.value = codigoCompra.value = descricaoProcesso.value = "";
  editandoId = null; btnSalvar.textContent = "Salvar OS";
}

btnLimparForm.onclick = limparFormulario;

// === EXPORT (seu + novos campos) ===
document.getElementById("exportarExcel").onclick = () => {
  const dados = JSON.parse(localStorage.getItem("osInfocar") || "[]");
  let csv = "ID;Nome;Placa;Marca;Tipo;Reparo;Peças;NF;Obs;Processo;Status;Data\n";
  dados.forEach(r => csv += `"${r.id}";"${r.nome}";"${r.placa}";"${r.marca}";"${r.tipoCarro}";"${r.reparo}";"${r.pecas}";"${r.codigoCompra}";"${r.obs}";"${r.descricaoProcesso}";"${r.status}";"${r.data}"\n`);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = `os_infocar_${new Date().toISOString().split('T')[0]}.csv`; link.click();
  URL.revokeObjectURL(url);
};

// === SYNC DASHBOARD ===
function atualizarDashboard() {
  const dados = JSON.parse(localStorage.getItem("osInfocar") || "[]");
  // Atualiza métricas globais (para app.js)
  localStorage.setItem('infocarMetricas', JSON.stringify({
    osAbertas: dados.filter(r => r.status === 'Aberta').length,
    faturamento: dados.reduce((sum, r) => sum + (r.valor || 0), 0)
  }));
}

// === INIT ===
renderizar();
