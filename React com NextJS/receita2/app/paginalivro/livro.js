import React from 'react';

import Navigation from '../../pages/navigation';
import styles from '../../styles/livro.module.css'; 

export default function Livros() {
  return (
    <div>
      <Navigation />
      <div className={styles.containerLivro}>
        <h1 className={styles.entreemlivro}>Sugestões de Leitura</h1>
        <p>Confira algumas recomendações de livros ou envie o seu favorito!</p>

        <div className={styles.livroDetalhes}>
          <div className={styles.livroInfo}>
            <h2>Livros Recomendados</h2>
            <p>Aqui estão algumas leituras que valem a pena:</p>
            <ul>
              <li><strong>1984</strong> — George Orwell</li>
              <li><strong>Sapiens</strong> — Yuval Noah Harari</li>
              <li><strong>Dom Casmurro</strong> — Machado de Assis</li>
              <li><strong>O Pequeno Príncipe</strong> — Antoine de Saint-Exupéry</li>
            </ul>
          </div>

          <div className={styles.livroForm}>
            <h2>Envie sua Sugestão</h2>
            <form action="#" method="post">
              <label className={styles.label} htmlFor="name">Seu Nome:</label>
              <input
                className={styles.inputField}
                type="text"
                id="name"
                name="name"
                required
              />

              <label className={styles.label} htmlFor="book">Nome do Livro:</label>
              <input
                className={styles.inputField}
                type="text"
                id="book"
                name="book"
                required
              />

              <label className={styles.label} htmlFor="reason">Por que recomenda?</label>
              <textarea
                className={styles.textArea}
                id="reason"
                name="reason"
                rows="4"
                required
              ></textarea>

              <button className={styles.submitButton} type="submit">
                Enviar Sugestão
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
