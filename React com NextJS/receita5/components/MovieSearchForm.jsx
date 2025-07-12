export default function MovieSearchForm({ onSearch, query, year, type, setQuery, setYear, setType, isLoading }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      <label htmlFor="title">Título</label>
      <input
        id="title"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite o filme"
      />

      <label htmlFor="year">Ano</label>
      <input
        id="year"
        type="text"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Ano (ex: 2020)"
      />

      <label htmlFor="type">Tipo</label>
      <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Todos</option>
        <option value="movie">Filme</option>
        <option value="series">Série</option>
        <option value="episode">Episódio</option>
      </select>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Pesquisando...' : 'Pesquisar'}
      </button>
    </form>
  );
}
