const whatsappVendedor = '5585991822601';

let produtos = JSON.parse(localStorage.getItem('produtos')) || [
  { id: 1, nome: 'Cesto de Palha', preco: 30, estoque: 5 },
  { id: 2, nome: 'Rapadura', preco: 10, estoque: 10 },
  { id: 3, nome: 'Castanha de Caju', preco: 25, estoque: 8 }
];

let carrinho = [];

function salvarProdutos() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
}

/* LOJA */
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
  let msg = 'Pedido:%0A';
  carrinho.forEach(i => msg += `• ${i.nome} - R$ ${i.preco}%0A`);
  window.open(`https://wa.me/${whatsappVendedor}?text=${msg}`);
  carrinho = [];
  renderCarrinho();
}

/* ADMIN */
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
        <td><input id="estoque-${p.id}" type="number" value="${p.estoque}"></td>
        <td><input id="preco-${p.id}" type="number" value="${p.preco}"></td>
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

function criarProduto() {
  produtos.push({
    id: Date.now(),
    nome: novoNome.value,
    preco: Number(novoPreco.value),
    estoque: Number(novoEstoque.value)
  });
  salvarProdutos();
  renderAdmin();
  renderProdutos();
}

renderProdutos();
renderCarrinho();
renderAdmin();
