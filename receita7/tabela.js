function carregarTabela(dados, cabecalhos, idElemento = "itensDiv") {
    const div = document.getElementById(idElemento);
    if (!dados || dados.length === 0) {
        div.innerHTML = "<p>Nenhum dado encontrado.</p>";
        return;
    }

    const cabecalhoHtml = cabecalhos.map(cabecalho => `<th>${cabecalho}</th>`).join("");

    const corpoHtml = dados.map(item => {
        const colunas = cabecalhos.map(cabecalho => {
            
            const chave = cabecalho.toLowerCase().replace(" ", "_");
            return `<td>${item[chave] || "Não disponível"}</td>`;
        }).join("");
        return `<tr>${colunas}</tr>`;
    }).join("");

    const tabelaHtml = `
        <table>
            <thead>
                <tr>${cabecalhoHtml}</tr>
            </thead>
            <tbody>
                ${corpoHtml}
            </tbody>
        </table>
    `;

    div.innerHTML = tabelaHtml;
}