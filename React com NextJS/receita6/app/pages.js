'use client';

import { useState } from 'react';
import styles from './movie.module.css'; // Importa o CSS Module

export default function Home() {
  const [resultMovies, setResultMovies] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [yearSearchKey, setYearSearchKey] = useState('');

  async function handleAction(event) {
    event.preventDefault();

    const response = await fetch(
      `https://www.omdbapi.com/?apikey=f189dce7&s=${searchKey}&y=${yearSearchKey}`
    );
    const data = await response.json();

    setResultMovies(data.Search || []);
  }

  return (
    <div className={styles.pageContainer}>
      <MovieForm
        handleAction={handleAction}
        searchKey={searchKey}
        setSearchKey={setSearchKey}
        yearSearchKey={yearSearchKey}
        setYearSearchKey={setYearSearchKey}
      />
      <MovieTable movies={resultMovies} />
    </div>
  );
}

function MovieForm({ handleAction, searchKey, setSearchKey, yearSearchKey, setYearSearchKey }) {
  return (
    <form onSubmit={handleAction} className={styles.movieForm}>
      <label htmlFor="idTitleSearchKey">Título</label>
      <input
        id="idTitleSearchKey"
        name="titleSearchKey"
        value={searchKey}
        onChange={(e) => setSearchKey(e.target.value)}
        placeholder="Ex: Matrix"
      />

      <label htmlFor="idYearSearchKey">Ano</label>
      <input
        id="idYearSearchKey"
        name="yearSearchKey"
        value={yearSearchKey}
        onChange={(e) => setYearSearchKey(e.target.value)}
        placeholder="Ex: 1999"
      />

      <button type="submit" className={styles.searchButton}>Pesquisar</button>
    </form>
  );
}

function MovieTable({ movies }) {
  return (
    <div className={styles.moviesContainer}>
      {movies.length === 0 ? (
        <p>Nenhum resultado encontrado.</p>
      ) : (
        movies.map((movie) => (
          <div key={movie.imdbID} className={styles.movieCard}>
            {movie.Poster !== 'N/A' ? (
              <img src={movie.Poster} alt={`Poster de ${movie.Title}`} className={styles.moviePoster} />
            ) : (
              <div className={styles.noPoster}>Poster não disponível</div>
            )}
            <div className={styles.movieTitle}>{movie.Title}</div>
            <div className={styles.movieYear}>{movie.Year}</div>
          </div>
        ))
      )}
    </div>
  );
}
