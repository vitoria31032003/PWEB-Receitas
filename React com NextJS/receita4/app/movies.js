import { useState, useEffect } from 'react';
import styles from '../styles/movies.module.css';

export default function Movies({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState(data.Search || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    const url = `http://www.omdbapi.com/?apikey=f189dce7&s=${searchQuery}&y=${year}&type=${type}`;
    const res = await fetch(url);
    const newData = await res.json();
    setResults(newData.Search || []);
    setIsLoading(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div>
        <input
          type="text"
          placeholder="Digite o filme"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ano (ex: 2020)"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className={styles.yearInput}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className={styles.selectInput}>
          <option value="">Todos</option>
          <option value="movie">Filme</option>
          <option value="series">Série</option>
          <option value="episode">Episódio</option>
        </select>
        <div className={styles.recado}>Essa pesquisa pode demorar alguns segundos</div>
        <button className={styles.searchButton} onClick={handleSearch}>Pesquisar</button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Carregando resultados...</div>
      ) : (
        <div className={styles.moviesContainer}>
          {results.length > 0 ? (
            results.map((m) => (
              <div key={m.imdbID} className={styles.movieCard}>
                <a href={`https://www.imdb.com/title/${m.imdbID}/`} target="_blank" rel="noopener noreferrer">
                  <img src={m.Poster !== 'N/A' ? m.Poster : '/no-poster.png'} alt={m.Title} />
                </a>
                <div className={styles.movieText}>{m.Title} --- {m.Year}</div>
                <div className={styles.movieText}>{m.imdbID} --- {m.Type}</div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>Nenhum resultado encontrado.</div>
          )}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;
  const searchQuery = query.q || 'bagdad';

  const res = await fetch(`http://www.omdbapi.com/?apikey=f189dce7&s=${searchQuery}`);
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}
