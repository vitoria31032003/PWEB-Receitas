import React from 'react';
import Link from 'next/link';
import styles from '../styles/index.module.css';
import Navigation from './navigation.js';

function MensagemPersonalizada({ m, className }) {
  return (
    <div className={className}>
      <p>{m}</p>
    </div>
  );
}

export default function Principal() {
  return (
    <div>
      <Navigation />

      <main className={styles.divinfo}>
        <h1 className={styles.bemvindo}>
          Descubra o Futuro com a <br /> TechNova!
        </h1>
        <img
          className={styles.imagem}
          src="https://img.freepik.com/fotos-premium/inteligencia-artificial-futurista-tecnologia-robo-com-fundo-digital_670147-1122.jpg"
          alt="Tecnologia futurista com IA"
        />
      </main>

      <section>
        <h2 className={styles.somosempresa}>
          Transformando empresas com inteligência artificial <br /> e automação de processos.
        </h2>
      </section>

      <section className={styles.divinfo2}>
        <img
          className={styles.imagem2}
          src="https://img.freepik.com/fotos-gratis/analise-de-dados-de-negocios-tecnologia-de-big-data-e-informacoes-estrategicas_53876-124516.jpg"
          alt="Análise de dados e automação"
        />
        <p className={styles.paragrafo}>
          "Na TechNova, desenvolvemos soluções baseadas em IA que otimizam operações, aumentam a produtividade e revolucionam a experiência do cliente. Unimos inovação e tecnologia para ajudar empresas a liderarem a transformação digital com agilidade e segurança."
        </p>
      </section>

      <MensagemPersonalizada
        className={styles.mensagempersonalizada}
        m="A TechNova é parceira na sua jornada de transformação digital. Inove com inteligência, automatize com confiança."
      />
    </div>
  );
}
