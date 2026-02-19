document.addEventListener("DOMContentLoaded", function () {
  const pais = document.getElementById("pais");
  const marca = document.getElementById("marca");
  const ano = document.getElementById("ano");
  const tipoManutencao = document.getElementById("tipoManutencao");
  const maoObra = document.getElementById("maoObra");
  const valorPecas = document.getElementById("valorPecas");
  const total = document.getElementById("total");
  const form = document.getElementById("formOS");
  const lista = document.getElementById("lista");
  const limpar = document.getElementById("limparForm");
  const vozBtn = document.getElementById("vozBtn");

  // SISTEMA DE VOZ
  const recognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  let vozAtiva = false;

  if (recognition && vozBtn) {
    const recognitionInstance = new recognition();
    recognitionInstance.lang = 'pt-BR';
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;

    vozBtn.addEventListener("click", function() {
      if (vozAtiva) {
        recognitionInstance.stop();
        vozAtiva = false;
        vozBtn.textContent = "Voz";
        vozBtn.style.background = "";
      } else {
        recognitionInstance.start();
        vozAtiva = true;
        vozBtn.textContent = "Parar";
        vozBtn.style.background = "#ef4444";
        falar("Diga o nome do cliente");
      }
    });

    recognitionInstance.onresult = function(event) {
      const texto = event.results[0][0].transcript;
      document.getElementById("cliente").value = texto;
      falar("Cliente " + texto + " adicionado");
    };

    recognitionInstance.onerror = recognitionInstance.onend = function() {
      vozAtiva = false;
      vozBtn.textContent = "Voz";
      vozBtn.style.background = "";
    };
  }

  // FALAR
  function falar(texto) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }

  // MARCAS POR PAÍS
  const marcasPorPais = {
    Brasil: ["Fiat", "Volkswagen", "Chevrolet", "Ford", "Renault", "Peugeot", "Toyota"],
    Alemanha: ["BMW", "Mercedes", "Audi", "Volkswagen", "Porsche", "Opel"],
    Itália: ["Fiat", "Ferrari", "Lamborghini", "Maserati", "Alfa Romeo"],
    França: ["Peugeot", "Renault", "Citroën", "DS Automobiles"],
    "Reino Unido": ["Land Rover", "Jaguar", "Mini", "Aston Martin", "McLaren"],
    Suécia: ["Volvo", "Saab"],
    Espanha: ["Seat", "Cupra"],
    EUA: ["Ford", "Chevrolet", "Dodge", "Tesla", "Cadillac", "GMC", "Jeep", "Chrysler"],
    Japão: ["Toyota", "Honda", "Nissan", "Mazda", "Subaru", "Mitsubishi", "Suzuki", "Lexus"],
    China: ["BYD", "Chery", "Geely", "Great Wall", "Nio", "XPeng", "Li Auto"],
    "Coreia do Sul": ["Hyundai", "Kia", "Genesis"],
    México: ["Volkswagen", "Nissan", "GM"]
  };

  function popularMarcas(paisSelecionado = "") {
    marca.innerHTML = '<option value="" disabled selected>Selecione a marca</option>';
    if (paisSelecionado && marcasPorPais[paisSelecionado]) {
      marcasPorPais[paisSelecionado].forEach(m => {
        const option = document.createElement("option");
        option.value = m;
        option.textContent = m;
        marca.appendChild(option);
      });
    }
  }

  // SUB-MANUTENÇÕES POR TIPO
  const subManutencoes = {
    oleo: ["15W40", "5W30", "10W40", "Sintético Total", "Semi-sintético", "Mineral"],
    filtro: ["Óleo", "Ar", "Combustível", "Ar-condicionado", "Habitação"],
    freio: ["Pastilhas dianteiras", "Pastilhas traseiras", "Discos dianteiros", "Discos traseiros", "Fluido DOT4"],
    alinhamento: ["Alinhamento 4 rodas", "Balanceamento", "Câmbio", "Paralelismo"],
    suspensao: ["Amortecedores dianteiros", "Amortecedores traseiros", "Buchas", "Batente"],
    revisao: ["Km 10k", "Km 20k", "Km 40k", "Completa"],
    eletrica: ["Bateria", "Alternador", "Velas", "Cabo velas"],
    arcondicionado: ["Gás R134a", "Gás R1234yf", "Filtro seco", "Compressor"],
    outros: ["Personalizado", "Específico"]
  };

  function popularSubManutencao(tipo) {
    const subField = document.getElementById("subManutencaoField");
    const subSelect = document.getElementById("subManutencao");
    
    subSelect.innerHTML = '<option value="" disabled selected>Selecione especificação</option>';
    
    if (tipo && subManutencoes[tipo]) {
      subManutencoes[tipo].forEach(sub => {
        const option = document.createElement("option");
        option.value = sub;
        option.textContent = sub;
        subSelect.appendChild(option);
      });
      subField.style.display = "block";
    } else {
      subField.style.display = "none";
    }
  }

  // EVENTOS
  pais.addEventListener("change", function () {
    popularMarcas(this.value);
  });

  tipoManutencao.addEventListener("change", function() {
    popularSubManutencao(this.value);
  });

  // ANOS 1950-2026
  for (let i = 2026; i >= 1950; i--) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    ano.appendChild(option);
  }

  // CALCULAR TOTAL
  function calcularTotal() {
    const mao = parseFloat(maoObra.value) || 0;
    const pecas = parseFloat(valorPecas.value) || 0;
    total.value = (mao + pecas).toFixed(2);
  }
  maoObra.addEventListener("input", calcularTotal);
  valorPecas.addEventListener("input", calcularTotal);

  // SALVAR OS
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    
    const os = {
      codigo: document.getElementById("codigoOS").value,
      status: document.getElementById("statusOS").value,
      responsavel: document.getElementById("nome").value,
      cliente: document.getElementById("cliente").value,
      pais: pais.value,
      marca: marca.value,
      modelo: document.getElementById("modelo").value,
      ano: ano.value,
      placa: document.getElementById("placa").value,
      km: document.getElementById("km").value,
      tipoManutencao: tipoManutencao.value,
      subManutencao: document.getElementById("subManutencao") ? document.getElementById("subManutencao").value : '',
      descricaoManutencao: document.getElementById("descricaoManutencao") ? document.getElementById("descricaoManutencao").value : '',
      observacoes: document.getElementById("observacoes") ? document.getElementById("observacoes").value : '',
      total: total.value,
      data: new Date().toLocaleDateString('pt-BR')
    };

    const listaOS = JSON.parse(localStorage.getItem("ordens")) || [];
    listaOS.push(os);
    localStorage.setItem("ordens", JSON.stringify(listaOS));

    form.reset();
    popularMarcas();
    popularSubManutencao('');
    mostrarOS();
    falar("OS " + os.codigo + " salva. " + os.tipoManutencao + " - Total " + os.total + " reais.");
  });

  limpar.addEventListener("click", function () {
    form.reset();
    popularMarcas();
    popularSubManutencao('');
    document.getElementById("subManutencaoField").style.display = "none";
    falar("Formulário limpo");
  });

  // MOSTRAR OS
  function mostrarOS() {
    lista.innerHTML = "";
    const listaOS = JSON.parse(localStorage.getItem("ordens")) || [];
    
    listaOS.reverse().forEach(os => {
      const div = document.createElement("div");
      div.className = "os-card";
      
      const servicoResumo = os.subManutencao ? `${os.tipoManutencao} - ${os.subManutencao}` : os.tipoManutencao || 'N/I';
      const descResumo = os.descricaoManutencao ? os.descricaoManutencao.substring(0, 40) + '...' : '';
      
      div.innerHTML = `
        <div class="os-header">
          <div class="os-codigo">${os.codigo}</div>
          <span class="os-status status-${os.status.toLowerCase().replace(/ /g,'-')}">${os.status}</span>
        </div>
        <div class="os-detalhes">
          <div><strong>Cliente:</strong> ${os.cliente}</div>
          <div><strong>Responsável:</strong> ${os.responsavel}</div>
          <div><strong>Veículo:</strong> ${os.marca} ${os.modelo} (${os.ano}) - ${os.placa}</div>
          <div><strong>Serviço:</strong> ${servicoResumo}</div>
          ${descResumo ? `<div><strong>Detalhes:</strong> ${descResumo}</div>` : ''}
          ${os.observacoes ? `<div><strong>Obs:</strong> ${os.observacoes.substring(0, 40)}...</div>` : ''}
          <div><strong>KM/Data:</strong> ${os.km || 0}km - ${os.data}</div>
        </div>
        <div class="os-total">R$ ${parseFloat(os.total).toFixed(2)}</div>
      `;
      lista.appendChild(div);
    });
  }

  // INICIALIZAR
  popularMarcas();
  mostrarOS();
});
