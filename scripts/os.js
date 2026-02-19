class InfocarPro {

  constructor() {
    this.DB_KEY = "infocar_os_v8";

    this.initData();
    this.initElements();
    this.bindEvents();
    this.initVoice(); // 🎤 ATIVADO AQUI
    this.load();

    this.updatePaises();
    this.updateMarcas();
    this.updateModelos();
    this.updateServico();
    this.render();
  }

  /* ==========================
     BASE COMPLETA EXPANDIDA
  ========================== */

  initData() {

    this.BASE = {

      Brasil: {
        Fiat: ["Uno", "Palio", "Mobi", "Argo", "Cronos", "Toro", "Strada", "Fastback"],
        Volkswagen: ["Gol", "Voyage", "Polo", "Virtus", "T-Cross", "Nivus", "Jetta", "Amarok"],
        Chevrolet: ["Onix", "Prisma", "Cruze", "Tracker", "S10", "Spin", "Montana"],
        Ford: ["Ka", "Fiesta", "Focus", "Ranger", "EcoSport"],
        Toyota: ["Corolla", "Yaris", "Hilux", "SW4"],
        Honda: ["Civic", "City", "Fit", "HR-V", "WR-V"],
        Hyundai: ["HB20", "Creta", "Tucson", "Santa Fe"],
        Renault: ["Kwid", "Sandero", "Logan", "Duster", "Oroch"],
        Jeep: ["Renegade", "Compass", "Commander", "Gladiator"]
      },

      Alemanha: {
        BMW: ["320i", "330i", "X1", "X3", "X5", "M3", "M4"],
        Mercedes: ["C180", "C200", "GLA", "GLC", "E300", "A200"],
        Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
        Porsche: ["911", "Cayenne", "Macan", "Panamera"],
        Volkswagen: ["Golf", "Passat", "Tiguan"]
      },

      EUA: {
        Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
        Dodge: ["Challenger", "Charger", "RAM 1500"],
        Chevrolet: ["Camaro", "Silverado"],
        Ford: ["Mustang", "F-150"]
      },

      Japao: {
        Nissan: ["Versa", "Sentra", "Kicks", "Frontier", "GT-R"],
        Mitsubishi: ["Lancer", "ASX", "Outlander", "Pajero"],
        Subaru: ["Impreza", "Forester", "WRX"],
        Toyota: ["Supra", "Corolla", "Camry"],
        Honda: ["Accord", "Civic Type R"]
      }
    };

    this.SERVICOS = {
      oleo: { tarefas: ["Troca óleo", "Troca filtro óleo"], campos: ["oleo"] },
      freio: { tarefas: ["Pastilhas", "Discos", "Fluido"], campos: [] },
      motor: { tarefas: ["Velas", "Bobinas", "Correia dentada"], campos: [] }
    };

    this.OLEOS = ["0W20", "5W30", "5W40", "10W40"];
  }

  /* ==========================
     UI
  ========================== */

  initElements() {
    this.UI = {
      form: $("#formOS"),
      lista: $("#lista"),
      pais: $("#pais"),
      marca: $("#marca"),
      modelo: $("#modelo"),
      servico: $("#tipoServico"),
      tarefas: $("#tarefasBox"),
      campos: $("#campos-dinamicos"),
      busca: $("#buscaOS")
    };
  }

  /* ==========================
     EVENTOS
  ========================== */

  bindEvents() {
    this.UI.pais?.addEventListener("change", () => {
      this.updateMarcas();
      this.updateModelos();
    });

    this.UI.marca?.addEventListener("change", () => this.updateModelos());
    this.UI.servico?.addEventListener("change", () => this.updateServico());

    this.UI.form?.addEventListener("submit", (e) => this.save(e));
    this.UI.busca?.addEventListener("input", () => this.render());

    document.querySelector("#btnVoz")?.addEventListener("click", () => {
      this.recognition?.start();
    });
  }

  /* ==========================
     PAÍS → MARCA → MODELO
  ========================== */

  updatePaises() {
    const paises = Object.keys(this.BASE);
    if (!this.UI.pais) return;

    this.UI.pais.innerHTML =
      `<option value="">Selecione país</option>` +
      paises.map(p => `<option value="${p}">${p}</option>`).join("");
  }

  updateMarcas() {
    const pais = this.UI.pais?.value;
    const marcas = Object.keys(this.BASE[pais] || {});
    if (!this.UI.marca) return;

    this.UI.marca.innerHTML =
      `<option value="">Selecione marca</option>` +
      marcas.map(m => `<option value="${m}">${m}</option>`).join("");

    this.updateModelos();
  }

  updateModelos() {
    const pais = this.UI.pais?.value;
    const marca = this.UI.marca?.value;
    const modelos = this.BASE[pais]?.[marca] || [];
    if (!this.UI.modelo) return;

    this.UI.modelo.innerHTML =
      `<option value="">Selecione modelo</option>` +
      modelos.map(m => `<option value="${m}">${m}</option>`).join("");
  }

  /* ==========================
     VOZ INTELIGENTE
  ========================== */

  initVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "pt-BR";

    this.recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript.toLowerCase();
      console.log("🎤 Ouvido:", texto);
      this.processarComando(texto);
    };
  }

  processarComando(texto) {

    const campoCliente = document.querySelector("input[name='cliente']");
    const nomeMatch = texto.match(/cliente\s([a-z\s]+)/);
    if (nomeMatch && campoCliente) {
      campoCliente.value = nomeMatch[1];
    }

    Object.keys(this.BASE).forEach(pais => {
      if (texto.includes(pais.toLowerCase())) {
        this.UI.pais.value = pais;
        this.updateMarcas();
      }
    });

    const paisAtual = this.UI.pais.value;
    const marcas = this.BASE[paisAtual] || {};

    Object.keys(marcas).forEach(marca => {
      if (texto.includes(marca.toLowerCase())) {
        this.UI.marca.value = marca;
        this.updateModelos();
      }
    });

    const modelos = Object.values(marcas).flat();
    modelos.forEach(modelo => {
      if (texto.includes(modelo.toLowerCase())) {
        this.UI.modelo.value = modelo;
      }
    });

    if (texto.includes("óleo")) {
      this.UI.servico.value = "oleo";
      this.updateServico();
    }
  }

  /* ==========================
     SERVIÇOS
  ========================== */

  updateServico() {
    const servico = this.UI.servico?.value;
    const s = this.SERVICOS[servico];

    this.UI.tarefas.innerHTML = "";
    this.UI.campos.innerHTML = "";

    if (!s) return;

    this.UI.tarefas.innerHTML = s.tarefas
      .map(t => `<label><input type="checkbox" name="tarefas" value="${t}"> ${t}</label>`)
      .join("<br>");

    if (s.campos.includes("oleo")) {
      this.UI.campos.innerHTML =
        `<select name="oleo">
          <option value="">Selecione óleo</option>
          ${this.OLEOS.map(o => `<option value="${o}">${o}</option>`).join("")}
        </select>`;
    }
  }

  /* ==========================
     CRUD
  ========================== */

  save(e) {
    e.preventDefault();
    const fd = new FormData(this.UI.form);
    const d = Object.fromEntries(fd.entries());
    d.tarefas = fd.getAll("tarefas");
    d.id = Date.now();
    d.data = new Date().toLocaleString("pt-BR");

    this.data ||= {};
    this.data[d.id] = d;

    localStorage.setItem(this.DB_KEY, JSON.stringify(this.data));

    this.UI.form.reset();
    this.render();
  }

  load() {
    this.data = JSON.parse(localStorage.getItem(this.DB_KEY) || "{}");
  }

  render() {
    const arr = Object.values(this.data || {});
    if (!this.UI.lista) return;

    this.UI.lista.innerHTML = arr.map(os => `
      <div class="card">
        <b>${os.cliente || "Sem nome"}</b><br>
        ${os.pais || ""} ${os.marca || ""} ${os.modelo || ""}<br>
        Serviço: ${os.servico || ""}<br>
        <small>${os.data}</small>
      </div>
    `).join("");
  }
}

const $ = (s) => document.querySelector(s);

window.addEventListener("DOMContentLoaded", () => {
  new InfocarPro();
});
