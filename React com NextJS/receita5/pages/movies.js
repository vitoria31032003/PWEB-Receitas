import { useState, useEffect } from 'react';
import styles from '../styles/movies.module.css';
import MovieSearchForm from '../components/MovieSearchForm';

export default function Movies({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState(data.Search || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    const url = `http://www.omdbapi.com/?apikey=f189dce7&s=${searchQuery}&y=${year}&type=${type}`;
    const res = await fetch(url);
    const newData = await res.json();
    setResults(newData.Search || []);
    setIsLoading(false);
  };

  return (
    <div className={styles.pageContainer}>
      <MovieSearchForm
        onSearch={handleSearch}
        query={searchQuery}
        year={year}
        type={type}
        setQuery={setSearchQuery}
        setYear={setYear}
        setType={setType}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className={styles.loading}>Carregando resultados...</div>
      ) : (
        <div className={styles.moviesContainer}>
          {results.length > 0 ? (
            results.map((m) => (
              <div key={m.imdbID} className={styles.movieCard}>
                <a
                  href={`https://www.imdb.com/title/${m.imdbID}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={m.Poster !== 'N/A' ? m.Poster : '/no-poster.png'} alt={m.Title} />
                </a>
                <div className={styles.movieText}>
                  {m.Title} --- {m.Year}
                </div>
                <div className={styles.movieText}>
                  {m.imdbID} --- {m.Type}
                </div>
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
