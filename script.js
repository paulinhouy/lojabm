const whatsappVendedor = '5585991822601';

/* ================= DADOS ================= */
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
              <input 
                type="number" 
                min="1" 
                max="${p.estoque}" 
                value="1" 
                id="qtd-${p.id}">
              <button onclick="addCarrinho(${p.id})">
                Adicionar ao carrinho
              </button>
            `
        }
      </div>
    `;
  });
}

/* ================= CARRINHO ================= */
function addCarrinho(id) {
  const produto = produtos.find(p => p.id === id);
  const qtdInput = document.getElementById(`qtd-${id}`);
  const qtd = Number(qtdInput.value);

  if (!produto || qtd <= 0 || qtd > produto.estoque) {
    alert('Quantidade inválida');
    return;
  }

  for (let i = 0; i < qtd; i++) {
    carrinho.push({ ...produto });
  }

  produto.estoque -= qtd;
  salvarProdutos();

  renderProdutos();
  renderCarrinho();
}

function renderCarrinho() {
  const itens = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');

  if (!itens || !totalEl || !countEl) return;

  itens.innerHTML = '';
  let total = 0;

  carrinho.forEach(i => {
    itens.innerHTML += `
      <div class="cart-item">
        ${i.nome} - R$ ${i.preco.toFixed(2)}
      </div>
    `;
    total += i.preco;
  });

  totalEl.innerText = total.toFixed(2);
  countEl.innerText = carrinho.length;
}

function toggleCarrinho() {
  const cart = document.getElementById('cartDropdown');
  if (!cart) return;

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
    msg += `• ${i.nome} - R$ ${i.preco}%0A`;
    total += i.preco;
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
    /* DESKTOP */
    tabela.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td><input id="estoque-${p.id}" type="number" value="${p.estoque}"></td>
        <td><input id="preco-${p.id}" type="number" value="${p.preco}"></td>
        <td>
          <button onclick="atualizarEstoque(${p.id})">✔</button>
          <button onclick="atualizarPreco(${p.id})">💲</button>
          <button onclick="removerProduto(${p.id})">🗑</button>
        </td>
      </tr>
    `;

    /* MOBILE */
    cards.innerHTML += `
      <div class="admin-card">
        <h3>${p.nome}</h3>

        <label>Estoque</label>
        <input id="estoque-m-${p.id}" type="number" value="${p.estoque}">

        <label>Preço</label>
        <input id="preco-m-${p.id}" type="number" value="${p.preco}">

        <div class="acoes">
          <button onclick="
            document.getElementById('estoque-${p.id}').value =
            document.getElementById('estoque-m-${p.id}').value;
            atualizarEstoque(${p.id});
          ">✔</button>

          <button onclick="
            document.getElementById('preco-${p.id}').value =
            document.getElementById('preco-m-${p.id}').value;
            atualizarPreco(${p.id});
          ">💲</button>

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
  renderProdutos();
}

function atualizarPreco(id) {
  const p = produtos.find(p => p.id === id);
  p.preco = Number(document.getElementById(`preco-${id}`).value);
  salvarProdutos();
  renderProdutos();
}

function removerProduto(id) {
  produtos = produtos.filter(p => p.id !== id);
  salvarProdutos();
  renderAdmin();
  renderProdutos();
}

/* ===== CORREÇÃO DO BOTÃO ADICIONAR ===== */
function criarProduto() {
  const nomeInput = document.getElementById('novoNome');
  const precoInput = document.getElementById('novoPreco');
  const estoqueInput = document.getElementById('novoEstoque');

  const nome = nomeInput.value.trim();
  const preco = Number(precoInput.value);
  const estoque = Number(estoqueInput.value);

  if (!nome || preco <= 0 || estoque < 0) {
    alert('Preencha todos os campos corretamente');
    return;
  }

  produtos.push({
    id: Date.now(),
    nome,
    preco,
    estoque
  });

  salvarProdutos();
  renderAdmin();
  renderProdutos();

  nomeInput.value = '';
  precoInput.value = '';
  estoqueInput.value = '';
}

/* ================= INIT ================= */
renderProdutos();
renderCarrinho();
renderAdmin();
