export default function Home() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center py-10 px-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-semibold text-pokeRed">
          Bem-vindo à Pokédex!
        </h1>
        <p className="text-lg text-gray-700">
          Sua jornada pelo mundo Pokémon começa aqui.
        </p>
        <p className="text-sm text-gray-600">
          Explore Pokémon, tipos, gerações, regiões e muito mais!
        </p>
        <div className="space-x-4">
          <a
            href="/home"
            className="inline-block px-6 py-3 mt-6 bg-pokeRed text-white font-semibold rounded-lg transform transition-all hover:scale-105 hover:bg-opacity-90"
          >
            Explorar Pokédex
          </a>
          <a
            href="/about"
            className="inline-block px-6 py-3 mt-6 bg-pokeBlue text-white font-semibold rounded-lg transform transition-all hover:scale-105 hover:bg-opacity-90"
          >
            Saiba Mais
          </a>
        </div>
      </div>
    </div>
  );
}
