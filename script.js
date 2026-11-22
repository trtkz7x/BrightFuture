var addMTR = document.getElementById("addMTR");
var lista = document.getElementById("corpo-tabela-alunos"); // <tbody>: é o "taskList" do lista.js
var modalMatricula = document.getElementById("modal-matricula");
var modalObs = document.getElementById("modal-obs");
var formMatricula = document.getElementById("form-matricula");
var formObs = document.getElementById("form-observacao");
var overlayModal = document.getElementById("overlay-modal") || modalMatricula.parentNode;
var overlayObs = document.getElementById("overlay-modal-obs") || modalObs.parentNode;

var overlayFicha = document.getElementById("overlay-ficha");
var modalFicha = document.getElementById("modal-ficha");
var fichaNomeAluno = document.getElementById("ficha-nome-aluno");
var fichaTurmaAluno = document.getElementById("ficha-turma-aluno");
var listaHistoricoObs = document.getElementById("lista-historico-obs");
var btnFecharFicha = document.getElementById("btn-fechar-ficha");
var btnFecharFichaRodape = document.getElementById("btn-fechar-ficha-rodape");


document.body.appendChild(overlayObs);
document.body.appendChild(overlayFicha);
modalObs.appendChild(formObs);
formMatricula.appendChild(formMatricula.querySelector(".modal-rodape"));

overlayModal.classList.add("oculto");
overlayObs.classList.add("oculto");
overlayFicha.classList.add("oculto");


document.getElementById("tabela-alunos").style.whiteSpace = "nowrap";


var campoNome = formMatricula.querySelector("#nome");
var campoTurma = formMatricula.querySelector("#turma");
var campoCpf = formMatricula.querySelector("#cpf");
var campoTelefone = formMatricula.querySelector("#telefone");
var campoRnome = formMatricula.querySelector("#r-nome");
var campoRcontato = formMatricula.querySelector("#r-contato");
var campoMedia = formMatricula.querySelector("#media");
var campoFaltas = formMatricula.querySelector("#faltas");
var notas = formMatricula.querySelectorAll(".campo-nota");

var tituloModalMTR = document.getElementById("titulo-modal-matricula");
var btnfecharmdl = modalMatricula.querySelector(".btn-fechar");
var btncancelar = document.getElementById("btn-cancelar");
var btnsalvarMTR = document.getElementById("btn-salvar-matricula");
var linhaEditando = null;


var campoObsNome = formObs.querySelector("#nome");
var campoObsTurma = formObs.querySelector("#turma");
var campoObsTelefone = formObs.querySelector("#telefone");
var campoObs = formObs.querySelector("#obs");
var btnfecharObs = modalObs.querySelector(".btn-fechar");
var btncancelarObs = document.getElementById("btn-cancelar-obs");
var btnsalvarObs = document.getElementById("btn-salvar-observacao"); 
var linhaObs = null; 
var mediaAprovacao = 7;
var mediaRecuperacao = 5;
var historicoObservacoes = {};



function preencherMedia() {
  var soma = 0;
  var qtd = 0;
  for (var i = 0; i < notas.length; i++) {
    if (notas[i].value != "") {
      soma = soma + parseFloat(notas[i].value);
      qtd = qtd + 1;
    }
  }
  if (qtd == 0) {
    campoMedia.value = "";
  } else {
    campoMedia.value = (Math.round((soma / qtd) * 10) / 10).toFixed(1);
  }
  return qtd;
}


function proximaMatricula() {
  var maior = 1000000;
  var linhas = lista.querySelectorAll("tr");
  for (var i = 0; i < linhas.length; i++) {
    var numero = parseInt(linhas[i].cells[0].textContent);
    if (numero > maior) {
      maior = numero;
    }
  }
  return maior + 1;
}


function criarCelula(linha, texto) {
  var td = document.createElement("td");
  td.textContent = texto;
  linha.appendChild(td);
  return td;
}


function aplicarSituacaoVisual(celula, situacao) {
  celula.innerHTML = "";
  var bolinha = document.createElement("span");
  bolinha.className = "status-circulo aprovado";
  if (situacao == "Recuperação") {
    bolinha.className = "status-circulo recuperacao";
    bolinha.title = "Recuperação";
  } else if (situacao == "Reprovado") {
    bolinha.className = "status-circulo reprovado";
    bolinha.title = "Reprovado";
  } else {
    bolinha.title = situacao || "Aprovado";
  }
  celula.appendChild(bolinha);
}


function ligarBotoes(linha) {
  var botoes = linha.querySelectorAll("button"); // [0] Ficha  [1] Obs.  [2] Editar  [3] Apagar

  botoes[0].addEventListener("click", function () {
    abrirFicha(linha);
  });

  botoes[1].addEventListener("click", function () {
    abrirObs(linha);
  });

  botoes[2].addEventListener("click", function () {
    abrirEditar(linha);
  });

  botoes[3].addEventListener("click", function () {
    linha.remove();
  });
}


function abrirFicha(linha) {
  overlayModal.classList.add("oculto");
  overlayObs.classList.add("oculto");

  var matricula = linha.cells[0].textContent.trim();
  fichaNomeAluno.textContent = linha.cells[1].textContent.trim();
  fichaTurmaAluno.textContent = linha.cells[2].textContent.trim();

  var btnFicha = linha.querySelector(".btn-ficha");
  if (btnFicha) {
    btnFicha.classList.remove("tem-aviso");
  }

  listaHistoricoObs.innerHTML = "";
  var registros = historicoObservacoes[matricula] || [];

  if (registros.length == 0) {
    var liVazio = document.createElement("li");
    liVazio.className = "obs-vazia";
    liVazio.textContent = "Nenhuma observação registrada para este aluno.";
    listaHistoricoObs.appendChild(liVazio);
  } else {
    for (var i = registros.length - 1; i >= 0; i--) {
      var li = document.createElement("li");
      li.className = i == registros.length - 1 ? "obs-recente" : "obs-antiga";
      li.textContent = (i + 1) + ". " + registros[i];
      listaHistoricoObs.appendChild(li);
    }
  }

  overlayFicha.classList.remove("oculto");
}


function abrirEditar(linha) {
  overlayFicha.classList.add("oculto");
  overlayObs.classList.add("oculto");

  linhaEditando = linha;
  formMatricula.reset();

  campoNome.value = linha.cells[1].textContent.trim();
  campoTurma.value = linha.cells[2].textContent.trim();
  campoTelefone.value = linha.cells[3].textContent.trim();
  campoFaltas.value = linha.cells[4].textContent.trim();

  campoCpf.value = linha.getAttribute("data-cpf") || "";
  campoRnome.value = linha.getAttribute("data-r-nome") || "";
  campoRcontato.value = linha.getAttribute("data-r-contato") || "";

  var textoNotas = linha.cells[5].textContent.trim();
  if (textoNotas != "") {
    var partes = textoNotas.split(" / ");
    for (var i = 0; i < notas.length; i++) {
      notas[i].value = partes[i] && partes[i] != "-" ? partes[i] : "";
    }
  }
  preencherMedia();

  tituloModalMTR.textContent = "Editar Matrícula";
  btnsalvarMTR.textContent = "Salvar mudanças";
  overlayModal.classList.remove("oculto");
}


function abrirObs(linha) {
  overlayModal.classList.add("oculto");
  overlayFicha.classList.add("oculto");

  linhaObs = linha;
  campoObsNome.value = linha.cells[1].textContent;
  campoObsTurma.value = linha.cells[2].textContent;
  campoObsTelefone.value = linha.cells[3].textContent;
  campoObs.value = "";
  overlayObs.classList.remove("oculto");
}




addMTR.addEventListener("click", function () {
  overlayFicha.classList.add("oculto");
  overlayObs.classList.add("oculto");

  linhaEditando = null;
  formMatricula.reset();
  tituloModalMTR.textContent = "Cadastro de Matrícula";
  btnsalvarMTR.textContent = "Salvar Matrícula";
  overlayModal.classList.remove("oculto");
});

btnfecharmdl.addEventListener("click", function () {
  linhaEditando = null;
  overlayModal.classList.add("oculto");
});

btncancelar.addEventListener("click", function () {
  linhaEditando = null;
  overlayModal.classList.add("oculto");
});


btnfecharObs.addEventListener("click", function () {
  overlayObs.classList.add("oculto");
});

if (btncancelarObs) {
  btncancelarObs.addEventListener("click", function () {
    overlayObs.classList.add("oculto");
  });
}

if (btnFecharFicha) {
  btnFecharFicha.addEventListener("click", function () {
    overlayFicha.classList.add("oculto");
  });
}

if (btnFecharFichaRodape) {
  btnFecharFichaRodape.addEventListener("click", function () {
    overlayFicha.classList.add("oculto");
  });
}


for (var n = 0; n < notas.length; n++) {
  notas[n].addEventListener("input", preencherMedia);
}


btnsalvarMTR.addEventListener("click", function (evento) {
  evento.preventDefault(); 

  
  var obrigatorios = [campoNome, campoTurma, campoCpf, campoTelefone, campoRnome, campoRcontato];
  for (var i = 0; i < obrigatorios.length; i++) {
    if (obrigatorios[i].value.trim() == "") {
      window.alert("Preencha o campo: " + obrigatorios[i].previousElementSibling.textContent);
      obrigatorios[i].focus();
      return;
    }
  }
  for (var j = 0; j < notas.length; j++) {
    if (notas[j].value != "" && (parseFloat(notas[j].value) < 0 || parseFloat(notas[j].value) > 10)) {
      window.alert("As notas devem estar entre 0 e 10");
      notas[j].focus();
      return;
    }
  }
  if (campoFaltas.value != "" && parseInt(campoFaltas.value) < 0) {
    window.alert("As faltas não podem ser negativas");
    campoFaltas.focus();
    return;
  }

  
  var qtd = preencherMedia();
  var media = campoMedia.value;
  var faltas = campoFaltas.value == "" ? 0 : parseInt(campoFaltas.value);

  var textoNotas = "";
  if (qtd > 0) {
    var partes = [];
    for (var k = 0; k < notas.length; k++) {
      partes.push(notas[k].value == "" ? "-" : notas[k].value);
    }
    textoNotas = partes.join(" / ");
  }

  var situacao = "";
  if (qtd > 0 && qtd < 4) {
    situacao = "Em andamento"; 
  }
  if (qtd == 4) {
    if (parseFloat(media) >= mediaAprovacao) {
      situacao = "Aprovado";
    } else if (parseFloat(media) >= mediaRecuperacao) {
      situacao = "Recuperação";
    } else {
      situacao = "Reprovado";
    }
  }

  if (linhaEditando != null) {
    linhaEditando.cells[1].textContent = campoNome.value.trim();
    linhaEditando.cells[2].textContent = campoTurma.value.trim();
    linhaEditando.cells[3].textContent = campoTelefone.value.trim();
    linhaEditando.cells[4].textContent = faltas;
    linhaEditando.cells[5].textContent = textoNotas;
    linhaEditando.cells[6].textContent = media;
    aplicarSituacaoVisual(linhaEditando.cells[7], situacao);

    linhaEditando.setAttribute("data-cpf", campoCpf.value.trim());
    linhaEditando.setAttribute("data-r-nome", campoRnome.value.trim());
    linhaEditando.setAttribute("data-r-contato", campoRcontato.value.trim());

    linhaEditando = null;
    formMatricula.reset();
    overlayModal.classList.add("oculto");
    return;
  }

  
  var linha = document.createElement("tr");
  criarCelula(linha, proximaMatricula());
  criarCelula(linha, campoNome.value.trim());
  criarCelula(linha, campoTurma.value.trim());
  criarCelula(linha, campoTelefone.value.trim());
  criarCelula(linha, faltas);
  criarCelula(linha, textoNotas);
  criarCelula(linha, media);
  var tdSituacao = criarCelula(linha, "");
  aplicarSituacaoVisual(tdSituacao, situacao);

  linha.setAttribute("data-cpf", campoCpf.value.trim());
  linha.setAttribute("data-r-nome", campoRnome.value.trim());
  linha.setAttribute("data-r-contato", campoRcontato.value.trim());

  var tdAcoes = document.createElement("td");
  var divAcoes = document.createElement("div");
  divAcoes.id = "actionbtn";
  
  divAcoes.innerHTML =
    '<button id="ficha" class="btn-ficha">Ficha</button> ' +
    '<button id="obspg">Obs.</button> ' +
    '<button id="edit">Editar</button> ' +
    '<button id="del">Apagar</button>';
  tdAcoes.appendChild(divAcoes);
  linha.appendChild(tdAcoes);

  
  lista.appendChild(linha);
  ligarBotoes(linha);
  formMatricula.reset();
  overlayModal.classList.add("oculto");
  console.log("Matricula salva com sucesso!");
});


if (btnsalvarObs) {
  btnsalvarObs.addEventListener("click", function (evento) {
    evento.preventDefault();
    var textoObs = campoObs.value.trim();
    if (textoObs != "" && linhaObs) {
      var matricula = linhaObs.cells[0].textContent.trim();
      if (!historicoObservacoes[matricula]) {
        historicoObservacoes[matricula] = [];
      }
      historicoObservacoes[matricula].push(textoObs);
      linhaObs.setAttribute("data-obs", textoObs);

      var btnFicha = linhaObs.querySelector(".btn-ficha");
      if (btnFicha) {
        btnFicha.classList.add("tem-aviso");
      }
    }
    campoObs.value = "";
    overlayObs.classList.add("oculto");
  });
}


var linhasIniciais = lista.querySelectorAll("tr");
for (var m = 0; m < linhasIniciais.length; m++) {
  ligarBotoes(linhasIniciais[m]);
}
