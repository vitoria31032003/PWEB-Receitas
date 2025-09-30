// Este componente usa as classes .pokeball-loading e .pokeball-loading-inner do seu globals.css
export default function PokeballLoader({ message }) {
  return (
    <div className="flex flex-col justify-center items-center py-20 text-center">
      <div className="pokeball-loading">
        <div className="pokeball-loading-inner"></div>
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700">
        {message || "Buscando Pokémon..."}
      </p>
    </div>
  );
}