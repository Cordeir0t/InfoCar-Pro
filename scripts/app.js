document.addEventListener("DOMContentLoaded", function () {

  const $ = (el) => document.querySelector(el);

  class InfoCarOS {

    constructor() {

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

    init() {

      this.gerarAnos();

      if ($("#pais"))
        $("#pais").addEventListener("change", () => this.carregarMarcas());

      if ($("#tipoServico"))
        $("#tipoServico").addEventListener("change", () => this.montarTarefas());

      if ($("#formOS"))
        $("#formOS").addEventListener("submit", (e) => this.salvar(e));

      if ($("#limparForm"))
        $("#limparForm").addEventListener("click", () => this.limpar());

      if ($("#maoObra"))
        $("#maoObra").addEventListener("input", () => this.calcularTotal());

      if ($("#valorPecas"))
        $("#valorPecas").addEventListener("input", () => this.calcularTotal());

      this.initVoice();
      this.carregarLista();
    }

    // ======================
    // GERAR ANOS 1950-2026
    // ======================
    gerarAnos() {

      const anoSelect = $("#ano");
      if (!anoSelect) return;

      anoSelect.innerHTML = "<option value=''>Selecione</option>";

      for (let ano = 2026; ano >= 1950; ano--) {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        anoSelect.appendChild(option);
      }
    }

    // ======================
    // CARREGAR MARCAS
    // ======================
    carregarMarcas() {

      const pais = $("#pais").value;
      const select = $("#marca");

      if (!select) return;

      select.innerHTML = "<option value=''>Selecione</option>";

      if (this.marcas[pais]) {
        this.marcas[pais].forEach(m => {
          const option = document.createElement("option");
          option.value = m;
          option.textContent = m;
          select.appendChild(option);
        });
      }
    }

    // ======================
    // MONTAR TAREFAS
    // ======================
    montarTarefas() {

      const tipo = $("#tipoServico").value;
      const box = $("#tarefasBox");
      if (!box) return;

      box.innerHTML = "";

      if (!this.SERVICOS[tipo]) return;

      this.SERVICOS[tipo].forEach(t => {

        const label = document.createElement("label");
        label.innerHTML = `
          <input type="checkbox" value="${t}"> ${t}
        `;

        box.appendChild(label);
      });
    }

    // ======================
    // CALCULAR TOTAL
    // ======================
    calcularTotal() {

      const mao = parseFloat($("#maoObra")?.value) || 0;
      const pecas = parseFloat($("#valorPecas")?.value) || 0;

      if ($("#total"))
        $("#total").value = (mao + pecas).toFixed(2);
    }

    // ======================
    // SALVAR OS
    // ======================
    salvar(e) {

      e.preventDefault();

      const tarefas = [...document.querySelectorAll("#tarefasBox input:checked")]
        .map(c => c.value);

      const lista = JSON.parse(localStorage.getItem("osList")) || [];

      let codigo = $("#codigoOS")?.value.trim();

      if (!codigo) {
        codigo = "OS-" + (lista.length + 1).toString().padStart(3,"0");
      }

      const os = {
        codigo,
        data: new Date().toLocaleDateString(),
        status: $("#statusOS")?.value,
        responsavel: $("#nome")?.value,
        cliente: $("#cliente")?.value,
        pais: $("#pais")?.value,
        marca: $("#marca")?.value,
        modelo: $("#modelo")?.value,
        ano: $("#ano")?.value,
        placa: $("#placa")?.value,
        km: $("#km")?.value,
        servico: $("#tipoServico")?.value,
        tarefas,
        descricao: $("#descricao")?.value,
        observacoes: $("#observacoes")?.value,
        laudo: $("#laudo")?.value,
        maoObra: $("#maoObra")?.value,
        pecas: $("#valorPecas")?.value,
        total: $("#total")?.value
      };

      lista.unshift(os);
      localStorage.setItem("osList", JSON.stringify(lista));

      alert("OS criada com sucesso!");

      this.limpar();
      this.carregarLista();
    }

    // ======================
    // LISTAR OS
    // ======================
    carregarLista() {

      const lista = JSON.parse(localStorage.getItem("osList")) || [];
      const box = $("#lista");
      if (!box) return;

      box.innerHTML = "";

      lista.slice(0,10).forEach(os => {

        box.innerHTML += `
          <div class="osCard">
            <strong>${os.codigo}</strong><br>
            ${os.cliente} - ${os.marca} ${os.modelo} (${os.ano})<br>
            Total: R$ ${os.total}
          </div>
        `;
      });
    }

    // ======================
    // LIMPAR
    // ======================
    limpar() {

      $("#formOS")?.reset();
      $("#tarefasBox") && ($("#tarefasBox").innerHTML = "");
      $("#total") && ($("#total").value = "");
    }

    // ======================
    // VOICE
    // ======================
    initVoice() {

      const btn = $("#voiceToggle");

      if (!btn || !("webkitSpeechRecognition" in window)) {
        if (btn) btn.style.display = "none";
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

  new InfoCarOS();

});
