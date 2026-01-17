const whatsappVendedor = '5585999999999';
const emailVendedor = 'vendedor@email.com';

let produtos = JSON.parse(localStorage.getItem('produtos')) || [
  { id: 1, nome: 'Cesto de Palha', preco: 30, estoque: 5 },
  { id: 2, nome: 'Rapadura', preco: 10, estoque: 10 },
  { id: 3, nome: 'Castanha de Caju', preco: 25, estoque: 8 }
];

let carrinho = [];
let historicoPedidos = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
let notificacoes = JSON.parse(localStorage.getItem('notificacoes')) || [];

// ================= STORAGE =================
function salvarProdutos() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

// ================= NOTIFICAÇÃO =================
function registrarEvento(tipo, detalhe) {
  const evento = {
    tipo,
    detalhe,
    data: new Date().toLocaleString()
  };

  notificacoes.push(evento);
  localStorage.setItem('notificacoes', JSON.stringify(notificacoes));

  window.open(
    `mailto:${emailVendedor}?subject=Notificação Loja&body=${tipo}: ${detalhe}`
  );
}

// ================= LOJA =================
function renderProdutos() {
  const lista = document.getElementById('listaProdutos');
  if (!lista) return;

  lista.innerHTML = '';
  produtos.forEach(p => {
    lista.innerHTML += `
      <div class="produto">
        <h3>${p.nome}</h3>
        <p>R$ ${p.preco.toFixed(2)}</p>
        <p>Estoque: ${p.estoque}</p>
        <button ${p.estoque === 0 ? 'disabled' : ''} onclick="addCarrinho(${p.id})">
          Comprar
        </button>
      </div>
    `;
  });
}

function addCarrinho(id) {
  const p = produtos.find(p => p.id === id);
  if (p && p.estoque > 0) {
    p.estoque--;
    carrinho.push(p);
    salvarProdutos();

    registrarEvento(
      'SAÍDA DE ESTOQUE',
      `${p.nome} (-1 unidade)`
    );

    renderCarrinho();
    renderProdutos();
  }
}

function renderCarrinho() {
  const lista = document.getElementById('itensCarrinho');
  if (!lista) return;

  lista.innerHTML = '';
  let total = 0;

  carrinho.forEach(i => {
    lista.innerHTML += `<li>${i.nome} - R$ ${i.preco}</li>`;
    total += i.preco;
  });

  document.getElementById('total').innerText = total.toFixed(2);
}

function finalizarPedido() {
  const nome = document.getElementById('nomeCliente').value;
  const endereco = document.getElementById('enderecoCliente').value;

  let total = carrinho.reduce((s, i) => s + i.preco, 0);

  historicoPedidos.push({
    cliente: nome,
    endereco,
    itens: [...carrinho],
    total,
    data: new Date().toLocaleString()
  });

  localStorage.setItem('historicoPedidos', JSON.stringify(historicoPedidos));

  registrarEvento(
    'NOVO PEDIDO',
    `Pedido de ${nome} - R$ ${total}`
  );

  let msg = `Pedido:%0ACliente: ${nome}%0AEndereço: ${endereco}%0A%0A`;
  carrinho.forEach(i => msg += `• ${i.nome} - R$ ${i.preco}%0A`);
  msg += `%0ATotal: R$ ${total}`;

  window.open(`https://wa.me/${whatsappVendedor}?text=${msg}`);
  carrinho = [];
  renderCarrinho();
}

// ================= ADMIN =================
function renderAdmin() {
  const tabela = document.getElementById('adminProdutos');
  if (!tabela) return;

  tabela.innerHTML = '';
  produtos.forEach(p => {
    tabela.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td><input type="number" id="estoque-${p.id}" value="${p.estoque}"></td>
        <td><input type="number" id="preco-${p.id}" value="${p.preco}"></td>
        <td>
          <button onclick="atualizarEstoque(${p.id})">✔</button>
          <button onclick="atualizarPreco(${p.id})">💲</button>
          <button onclick="removerProduto(${p.id})">🗑</button>
        </td>
      </tr>
    `;
  });
}

function atualizarEstoque(id) {
  const produto = produtos.find(p => p.id === id);
  const valor = Number(document.getElementById(`estoque-${id}`).value);

  produto.estoque = valor;
  salvarProdutos();

  registrarEvento(
    'ATUALIZAÇÃO DE ESTOQUE',
    `${produto.nome}: ${valor} unidades`
  );

  renderProdutos();
}

function atualizarPreco(id) {
  const produto = produtos.find(p => p.id === id);
  const valor = Number(document.getElementById(`preco-${id}`).value);

  produto.preco = valor;
  salvarProdutos();

  registrarEvento(
    'ALTERAÇÃO DE PREÇO',
    `${produto.nome}: R$ ${valor}`
  );

  renderProdutos();
}

function removerProduto(id) {
  const produto = produtos.find(p => p.id === id);
  if (!confirm('Deseja remover este produto?')) return;

  produtos = produtos.filter(p => p.id !== id);
  salvarProdutos();

  registrarEvento(
    'PRODUTO REMOVIDO',
    produto.nome
  );

  renderAdmin();
  renderProdutos();
}

// ================= CRIAR PRODUTO =================
function criarProduto() {
  const nome = document.getElementById('novoNome').value;
  const preco = Number(document.getElementById('novoPreco').value);
  const estoque = Number(document.getElementById('novoEstoque').value);

  if (!nome || preco <= 0 || estoque < 0) {
    alert('Preencha corretamente');
    return;
  }

  produtos.push({
    id: Date.now(),
    nome,
    preco,
    estoque
  });

  salvarProdutos();

  registrarEvento(
    'NOVO PRODUTO',
    `${nome} criado`
  );

  document.getElementById('novoNome').value = '';
  document.getElementById('novoPreco').value = '';
  document.getElementById('novoEstoque').value = '';

  renderAdmin();
  renderProdutos();
}

// ================= INIT =================
renderProdutos();
renderCarrinho();
renderAdmin();
