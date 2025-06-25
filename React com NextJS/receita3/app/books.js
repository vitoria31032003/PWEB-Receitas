import { useState } from 'react';
import styles from '../styles/books.module.css';

export default function Books({ data }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async () => {
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`);
    const newData = await res.json();
    data.docs = newData.docs;
  };

  return (
    <div className={styles.pageContainer}>
      <div>
        <input
          type="text"
          placeholder="Digite o título do livro"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles.recado}>A busca pode levar alguns segundos...</div>
        <button className={styles.searchButton} onClick={handleSearch}>Pesquisar</button>
      </div>
      <div className={styles.booksContainer}>
        {data.docs.map((book) => (
          <div key={book.key} className={styles.bookCard}>
            <a
              href={`https://openlibrary.org${book.key}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={
                  book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : '/default-book-cover.jpg'
                }
                alt={book.title}
              />
            </a>
            <div className={styles.bookText}>{book.title} — {book.first_publish_year || 'Ano desconhecido'}</div>
            <div className={styles.bookText}>{book.author_name?.join(', ') || 'Autor desconhecido'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;
  const searchQuery = query.q || 'dom casmurro';

  const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`);
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}
