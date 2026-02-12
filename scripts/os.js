class InfocarPro {
  constructor() {
    this.DB_KEY = "infocar_os_v5";
    this.initElements();
    this.initData();
    this.bindEvents();
    this.load();
    this.updateMarcas();   // garante selects populados
    this.updateModelos();  // garante modelos coerentes
    this.updateServico();  // garante tarefas/campos coerentes
    this.render();
  }

  /* ================= UI ================= */
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
      busca: $("#buscaOS"),
      status: $("#filtroStatus")
    };
  }

  /* ================= BASE DADOS ================= */
  initData() {
    this.BASE = {
      Brasil: {
        Fiat: ["Uno", "Palio", "Mobi", "Argo", "Cronos", "Toro", "Strada"],
        Volkswagen: ["Gol", "Voyage", "Polo", "Virtus", "T-Cross", "Nivus", "Jetta"],
        Chevrolet: ["Onix", "Prisma", "Cruze", "Tracker", "S10"],
        Ford: ["Ka", "Fiesta", "Focus", "Ranger"],
        Toyota: ["Corolla", "Yaris", "Hilux"],
        Honda: ["Civic", "City", "Fit", "HR-V"],
        Hyundai: ["HB20", "Creta", "Tucson"],
        Renault: ["Kwid", "Sandero", "Logan", "Duster"],
        Jeep: ["Renegade", "Compass", "Commander"]
      },
      Alemanha: {
        BMW: ["320i", "X1", "X3", "X5"],
        Mercedes: ["C180", "GLA", "GLC"],
        Audi: ["A3", "A4", "Q3", "Q5"],
        Porsche: ["911", "Cayenne", "Macan"]
      },
      Japao: {
        Nissan: ["Versa", "Sentra", "Kicks"],
        Mitsubishi: ["Lancer", "ASX", "Outlander"],
        Subaru: ["Impreza", "Forester"]
      }
    };

    this.SERVICOS = {
      oleo: { tarefas: ["Troca óleo", "Troca filtro", "Limpeza cárter"], campos: ["oleo"] },
      freio: { tarefas: ["Pastilhas", "Discos", "Fluido", "Sangria"], campos: ["freio"] },
      motor: { tarefas: ["Velas", "Bobinas", "Correia", "Bicos"], campos: ["motor"] },
      suspensao: { tarefas: ["Amortecedor", "Bucha", "Bieleta", "Mola"], campos: ["susp"] },
      eletrica: { tarefas: ["Bateria", "Alternador", "Motor partida", "Fiação"], campos: [] }
    };

    this.OLEOS = ["5W30", "5W40", "10W40", "0W20", "Sintético", "Semi"];
    this.FREIO_FLUIDO = ["DOT3", "DOT4", "DOT5"];
    this.MOTOR_TIPO = ["1.0", "1.4", "1.6", "2.0", "Turbo", "Diesel"];
  }

  /* ================= EVENTS ================= */
  bindEvents() {
    // optional chaining evita crash quando algum ID não existe na página [web:11]
    this.UI.pais?.addEventListener("change", () => {
      this.updateMarcas();
      this.updateModelos();
    });

    this.UI.marca?.addEventListener("change", () => this.updateModelos());
    this.UI.servico?.addEventListener("change", () => this.updateServico());

    this.UI.form?.addEventListener("submit", (e) => this.save(e));
    this.UI.busca?.addEventListener("input", () => this.render());
    this.UI.status?.addEventListener("change", () => this.render());
  }

  /* ================= SELECTS ================= */
  updateMarcas() {
    const pais = this.UI.pais?.value;
    const marcas = Object.keys(this.BASE[pais] || {});

    if (!this.UI.marca) return;

    this.UI.marca.innerHTML =
      `<option value="">Selecione marca</option>` +
      marcas.map((m) => `<option value="${m}">${m}</option>`).join("");

    // reseta modelo quando troca país
    if (this.UI.modelo) {
      this.UI.modelo.innerHTML = `<option value="">Selecione modelo</option>`;
    }
  }

  updateModelos() {
    const pais = this.UI.pais?.value;
    const marca = this.UI.marca?.value;
    const modelos = this.BASE[pais]?.[marca] || [];

    if (!this.UI.modelo) return;

    this.UI.modelo.innerHTML =
      `<option value="">Selecione modelo</option>` +
      modelos.map((m) => `<option value="${m}">${m}</option>`).join("");
  }

  /* ================= SERVIÇOS ================= */
  updateServico() {
    const servico = this.UI.servico?.value;
    const s = this.SERVICOS[servico];

    if (this.UI.tarefas) this.UI.tarefas.innerHTML = "";
    if (this.UI.campos) this.UI.campos.innerHTML = "";
    if (!s) return;

    if (this.UI.tarefas) {
      this.UI.tarefas.innerHTML = s.tarefas
        .map(
          (t) =>
            `<label><input type="checkbox" name="tarefas" value="${t}"> ${t}</label>`
        )
        .join("<br>");
    }

    let camposHTML = "";
    if (s.campos.includes("oleo")) camposHTML += this.selectHTML("Óleo", "oleo", this.OLEOS);
    if (s.campos.includes("freio")) camposHTML += this.selectHTML("Fluido", "fluido", this.FREIO_FLUIDO);
    if (s.campos.includes("motor")) camposHTML += this.selectHTML("Motor", "motor", this.MOTOR_TIPO);

    if (this.UI.campos) this.UI.campos.innerHTML = camposHTML;
  }

  selectHTML(label, name, list) {
    return `
      <div style="margin: 10px 0;">
        <label>${label}: </label>
        <select name="${name}">
          <option value="">Selecione</option>
          ${list.map((x) => `<option value="${x}">${x}</option>`).join("")}
        </select>
      </div>`;
  }

  /* ================= CRUD ================= */
  save(e) {
    e?.preventDefault();
    if (!this.UI.form) return;

    const fd = new FormData(this.UI.form);

    // Monta objeto sem perder campos repetidos (checkboxes) [web:6]
    const d = Object.fromEntries(fd.entries());
    d.tarefas = fd.getAll("tarefas"); // pega todas marcadas [web:6]

    d.id = d.id || this.uid();
    d.data = this.now();

    this.data ||= {};
    this.data[d.id] = d;
    this.persist();

    this.UI.form.reset();
    this.updateServico(); // limpa tarefas/campos visuais pós-reset
    this.render();
    this.toast("OS salva com sucesso!");
  }

  load() {
    this.data = JSON.parse(localStorage.getItem(this.DB_KEY) || "{}");
  }

  persist() {
    localStorage.setItem(this.DB_KEY, JSON.stringify(this.data));
  }

  /* ================= RENDER ================= */
  render() {
    let arr = Object.values(this.data || {});
    const q = this.UI.busca?.value?.toLowerCase() || "";

    if (q) {
      arr = arr.filter((x) => JSON.stringify(x).toLowerCase().includes(q));
    }

    // Se você quiser filtrar por status, implemente aqui usando this.UI.status.value

    if (!this.UI.lista) return;

    this.UI.lista.innerHTML = arr
      .map(
        (os) => `
        <div class="card" style="border:1px solid #ccc; padding:15px; margin:10px 0; border-radius:5px;">
          <b>${os.cliente || "Sem nome"}</b><br>
          <div>${os.marca || ""} ${os.modelo || ""}</div>
          <div>Serviço: ${os.servico || ""}</div>
          <div>Tarefas: ${(os.tarefas || []).join(", ") || "Nenhuma"}</div>
          <div><small>${os.data || ""}</small></div>
        </div>
      `
      )
      .join("");
  }

  /* ================= UTILS ================= */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  now() {
    return new Date().toLocaleString("pt-BR");
  }
  toast(t) {
    alert(t);
  }
}

/* ================= START ================= */
const $ = (s) => document.querySelector(s);

window.addEventListener("DOMContentLoaded", () => {
  new InfocarPro();
});
