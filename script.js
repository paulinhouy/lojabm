const whatsappVendedor = '5585991822601';

/* ================= ESTADO GLOBAL ================= */
let produtos = JSON.parse(localStorage.getItem('produtos')) || [
  { id: 1, nome: 'Cesto de Palha', preco: 30, estoque: 5 },
  { id: 2, nome: 'Rapadura', preco: 10, estoque: 10 },
  { id: 3, nome: 'Castanha de Caju', preco: 25, estoque: 8 }
];

let carrinho = [];

/* ================= STORAGE ================= */
function salvarProdutos() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

/* 🔥 SINCRONIZAÇÃO EM TEMPO REAL */
window.addEventListener('storage', (event) => {
  if (event.key === 'produtos') {
    produtos = JSON.parse(event.newValue) || [];
    renderProdutos();
    renderAdmin();
    renderCarrinho();
  }
});

/* ================= LOJA ================= */
function renderProdutos() {
  const lista = document.getElementById('listaProdutos');
  if (!lista) return;

  lista.innerHTML = '';

  produtos.forEach(p => {
    lista.innerHTML += `
      <div class="produto">
        <h3>${p.nome}</h3>
        <p>R$ ${p.preco.toFixed(2)}</p>

        ${
          p.estoque === 0
            ? `<p style="color:red;font-weight:bold;">Item indisponível</p>`
            : `
              <input type="number" min="1" max="${p.estoque}" value="1" id="qtd-${p.id}">
              <button onclick="addCarrinho(${p.id})">Adicionar ao carrinho</button>
            `
        }
      </div>
    `;
  });
}

function addCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  const qtd = Number(document.getElementById(`qtd-${id}`).value);

  if (!produto || qtd <= 0 || qtd > produto.estoque) {
    alert('Quantidade inválida');
    return;
  }

  carrinho.push({
    id: produto.id,
    nome: produto.nome,
    preco: produto.preco,
    qtd
  });

  produto.estoque -= qtd;
  salvarProdutos();

  renderProdutos();
  renderCarrinho();
}

/* ================= CARRINHO ================= */
function renderCarrinho() {
  const itens = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');

  if (!itens) return;

  itens.innerHTML = '';
  let total = 0;
  let count = 0;

  carrinho.forEach(i => {
    itens.innerHTML += `
      <div class="cart-item">
        ${i.nome} (${i.qtd}x) - R$ ${(i.preco * i.qtd).toFixed(2)}
      </div>
    `;
    total += i.preco * i.qtd;
    count += i.qtd;
  });

  totalEl.innerText = total.toFixed(2);
  countEl.innerText = count;
}

function toggleCarrinho() {
  const cart = document.getElementById('cartDropdown');
  cart.style.display = cart.style.display === 'block' ? 'none' : 'block';
}

function finalizarPedido() {
  if (carrinho.length === 0) {
    alert('Carrinho vazio');
    return;
  }

  let msg = 'Pedido:%0A';
  let total = 0;

  carrinho.forEach(i => {
    msg += `• ${i.nome} (${i.qtd}x) - R$ ${(i.preco * i.qtd).toFixed(2)}%0A`;
    total += i.preco * i.qtd;
  });

  msg += `%0ATotal: R$ ${total.toFixed(2)}`;

  window.open(`https://wa.me/${whatsappVendedor}?text=${msg}`);

  carrinho = [];
  renderCarrinho();
  toggleCarrinho();
}

/* ================= ADMIN ================= */
function renderAdmin() {
  const tabela = document.getElementById('adminProdutos');
  const cards = document.getElementById('adminCards');

  if (!tabela || !cards) return;

  tabela.innerHTML = '';
  cards.innerHTML = '';

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

    cards.innerHTML += `
      <div class="admin-card">
        <h3>${p.nome}</h3>

        <label>Estoque</label>
        <input type="number" id="estoque-m-${p.id}" value="${p.estoque}">

        <label>Preço</label>
        <input type="number" id="preco-m-${p.id}" value="${p.preco}">

        <div class="acoes">
          <button onclick="syncEstoque(${p.id})">✔</button>
          <button onclick="syncPreco(${p.id})">💲</button>
          <button onclick="removerProduto(${p.id})">🗑</button>
        </div>
      </div>
    `;
  });
}

function atualizarEstoque(id) {
  const p = produtos.find(p => p.id === id);
  p.estoque = Number(document.getElementById(`estoque-${id}`).value);
  salvarProdutos();
}

function atualizarPreco(id) {
  const p = produtos.find(p => p.id === id);
  p.preco = Number(document.getElementById(`preco-${id}`).value);
  salvarProdutos();
}

function syncEstoque(id) {
  document.getElementById(`estoque-${id}`).value =
    document.getElementById(`estoque-m-${id}`).value;
  atualizarEstoque(id);
}

function syncPreco(id) {
  document.getElementById(`preco-${id}`).value =
    document.getElementById(`preco-m-${id}`).value;
  atualizarPreco(id);
}

function removerProduto(id) {
  produtos = produtos.filter(p => p.id !== id);
  salvarProdutos();
}

/* ================= INIT ================= */
renderProdutos();
renderCarrinho();
renderAdmin();
