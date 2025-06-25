import React from 'react';
import Navigation from '../navigation';
import styles from '../../styles/frase.module.css'; 

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
            <div id="fraseDiv" className={styles.fraseDiv}></div> 
        </div>
    );
}

async function carregarFraseKanye() {
    try {
        const res = await fetch("https://api.kanye.rest/");
        const resposta = await res.json();

        const div = document.getElementById("fraseDiv"); 
        div.innerHTML = `"${resposta.quote}" — Kanye West`;
    } catch (err) {
        document.getElementById("fraseDiv").innerHTML = "Erro ao carregar frase da API.";
    }
}
