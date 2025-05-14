function carregarTabela(dados, cabecalhos, extratores, idElemento = "cervejasDiv") {

  const div = document.getElementById(idElemento);

  if (!dados || dados.length === 0) {
    div.innerHTML = "<p>Nenhum dado encontrado.</p>";
    return;
  }

  const cabecalhoHtml = cabecalhos.map(c => `<th>${c}</th>`).join("");
  const corpoHtml = dados.map(item => {
    const linha = extratores.map(fn => `<td>${fn(item)}</td>`).join("");
    return `<tr>${linha}</tr>`;
  }).join("");

  const tabelaHtml = `
    <table class="tabela">
      <thead><tr>${cabecalhoHtml}</tr></thead>
      <tbody>${corpoHtml}</tbody>
    </table>
  `;

  div.innerHTML = tabelaHtml;
}