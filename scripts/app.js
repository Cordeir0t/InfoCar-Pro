const $ = (el) => document.querySelector(el);

class InfoCarOS {

  constructor() {

    // ===============================
    // 🌍 MARCAS POR PAÍS
    // ===============================
    this.marcas = {
      Brasil:["Fiat","Chevrolet","Volkswagen","Ford","Toyota","Honda","Hyundai"],
      Alemanha:["BMW","Audi","Mercedes-Benz","Volkswagen","Porsche","Opel"],
      Japão:["Toyota","Honda","Nissan","Mazda","Mitsubishi","Subaru","Suzuki","Lexus"],
      EUA:["Ford","Chevrolet","Dodge","Jeep","Tesla","Cadillac"],
      França:["Peugeot","Renault","Citroën"],
      Itália:["Fiat","Ferrari","Lamborghini","Maserati","Alfa Romeo"],
      Coreia:["Hyundai","Kia","Genesis"],
      China:["BYD","Chery","Geely"],
      "Reino Unido":["Land Rover","Jaguar","Mini","Bentley"],
      Suécia:["Volvo"],
      Índia:["Tata","Mahindra"],
      Espanha:["SEAT","Cupra"]
    };

    // ===============================
    // 🔧 SERVIÇOS
    // ===============================
    this.SERVICOS = {
      oleo:["Troca de óleo","Filtro de óleo","Filtro de ar","Filtro de cabine"],
      freio:["Pastilhas","Discos","Fluido","Regulagem"],
      motor:["Velas","Correia dentada","Bomba d'água","Limpeza TBI","Injeção"],
      suspensao:["Amortecedor","Mola","Pivô","Bucha","Alinhamento"],
      eletrica:["Bateria","Alternador","Motor arranque","Scanner"],
      ar:["Carga de gás","Compressor","Higienização"],
      revisao:["Óleo","Filtros","Freios","Scanner","Suspensão"]
    };

    this.init();
  }

  // ===============================
  // 🚀 INICIALIZAÇÃO
  // ===============================
  init() {
    $("#pais").addEventListener("change", () => this.carregarMarcas());
    $("#tipoServico").addEventListener("change", () => this.montarTarefas());
    $("#formOS").addEventListener("submit", (e) => this.salvar(e));
    $("#limparForm").addEventListener("click", () => this.limpar());

    $("#maoObra").addEventListener("input", () => this.calcularTotal());
    $("#valorPecas").addEventListener("input", () => this.calcularTotal());

    this.gerarAnos();
    this.initVoice();
    this.carregarLista();
  }

  // ===============================
  // 📅 GERAR ANOS 1950-2026
  // ===============================
  gerarAnos() {
    const anoSelect = $("#ano");
    anoSelect.innerHTML = "<option value=''>Selecione</option>";

    for (let ano = 2026; ano >= 1950; ano--) {
      anoSelect.innerHTML += `<option value="${ano}">${ano}</option>`;
    }
  }

  // ===============================
  // 🚗 CARREGAR MARCAS
  // ===============================
  carregarMarcas() {
    const pais = $("#pais").value;
    const select = $("#marca");
    select.innerHTML = "<option value=''>Selecione</option>";

    if (this.marcas[pais]) {
      this.marcas[pais].forEach(m => {
        select.innerHTML += `<option value="${m}">${m}</option>`;
      });
    }
  }

  // ===============================
  // 🔧 MONTAR TAREFAS
  // ===============================
  montarTarefas() {
    const tipo = $("#tipoServico").value;
    const box = $("#tarefasBox");
    box.innerHTML = "";

    if (!this.SERVICOS[tipo]) return;

    this.SERVICOS[tipo].forEach(t => {
      box.innerHTML += `
        <label>
          <input type="checkbox" value="${t}"> ${t}
        </label>
      `;
    });
  }

  // ===============================
  // 💰 CALCULAR TOTAL
  // ===============================
  calcularTotal() {
    const mao = parseFloat($("#maoObra").value) || 0;
    const pecas = parseFloat($("#valorPecas").value) || 0;
    $("#total").value = (mao + pecas).toFixed(2);
  }

  // ===============================
  // 💾 SALVAR OS
  // ===============================
  salvar(e) {
    e.preventDefault();

    const tarefas = [...document.querySelectorAll("#tarefasBox input:checked")]
      .map(c => c.value);

    const lista = JSON.parse(localStorage.getItem("osList")) || [];

    let codigo = $("#codigoOS").value.trim();
    if (!codigo) {
      codigo = "OS-" + (lista.length + 1).toString().padStart(3,"0");
    }

    const os = {
      codigo,
      data: new Date().toLocaleDateString(),
      status: $("#statusOS").value,
      responsavel: $("#nome").value,
      cliente: $("#cliente").value,
      pais: $("#pais").value,
      marca: $("#marca").value,
      modelo: $("#modelo").value,
      ano: $("#ano").value,
      placa: $("#placa").value,
      km: $("#km").value,
      servico: $("#tipoServico").value,
      tarefas,
      descricao: $("#descricao").value,
      observacoes: $("#observacoes").value,
      laudo: $("#laudo").value,
      maoObra: $("#maoObra").value,
      pecas: $("#valorPecas").value,
      total: $("#total").value
    };

    lista.unshift(os);
    localStorage.setItem("osList", JSON.stringify(lista));

    alert("OS " + codigo + " criada com sucesso!");
    this.limpar();
    this.carregarLista();
  }

  // ===============================
  // 📋 LISTA
  // ===============================
  carregarLista() {
    const lista = JSON.parse(localStorage.getItem("osList")) || [];
    const box = $("#lista");
    box.innerHTML = "";

    lista.slice(0,10).forEach(os => {
      box.innerHTML += `
        <div class="osCard">
          <div class="osHeader">
            <strong>${os.codigo}</strong>
            <span>${os.status}</span>
          </div>

          <div><strong>${os.cliente}</strong> - ${os.marca} ${os.modelo} (${os.ano})</div>
          <div>Placa: ${os.placa} | KM: ${os.km}</div>
          <div>Serviço: ${os.servico}</div>
          <div><strong>Total: R$ ${os.total}</strong></div>
        </div>
      `;
    });
  }

  // ===============================
  // 🧹 LIMPAR
  // ===============================
  limpar() {
    $("#formOS").reset();
    $("#tarefasBox").innerHTML = "";
    $("#total").value = "";
  }

  // ===============================
  // 🎤 VOICE
  // ===============================
  initVoice() {
    const btn = $("#voiceToggle");

    if (!("webkitSpeechRecognition" in window)) {
      btn.style.display = "none";
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "pt-BR";

    btn.addEventListener("click", () => {
      recognition.start();
      btn.classList.add("listening");
    });

    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript.toLowerCase();

      if (texto.includes("cliente"))
        $("#cliente").value = texto.replace("cliente","").trim();

      if (texto.includes("modelo"))
        $("#modelo").value = texto.replace("modelo","").trim();

      if (texto.includes("placa"))
        $("#placa").value = texto.replace("placa","").trim();

      if (texto.includes("quilometragem"))
        $("#km").value = texto.replace("quilometragem","").trim();

      btn.classList.remove("listening");
    };

    recognition.onerror = () => {
      btn.classList.remove("listening");
    };
  }

}

document.addEventListener("DOMContentLoaded", () => {
  new InfoCarOS();
});
