import React from 'react';
import Navigation from '../navigation';
import styles from '../../styles/conselho.module.css';

export default function Sobre() {
    const click = () => {
        carregarFraseKanye();
    };

    return (
        <div>
            <Navigation />
            <button id="botaoCarregar" className={styles.botaoCarregar} onClick={click}>
                Carregar frase do Kanye West
            </button>
            <div id="conselhoDiv" className={styles.conselhoDiv}></div>
        </div>
    );
}

async function carregarFraseKanye() {
    try {
        const res = await fetch("https://api.kanye.rest/");
        const resposta = await res.json();

        const div = document.getElementById("conselhoDiv");
        div.innerHTML = `"${resposta.quote}" — Kanye West`;
    } catch (err) {
        document.getElementById("conselhoDiv").innerHTML = "Erro ao carregar frase da API.";
    }
}
