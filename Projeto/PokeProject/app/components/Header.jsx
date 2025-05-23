import Link from 'next/link';

export default function Header() {
    return (
      // Adicionado fundo escuro (bg-gray-800) e padding (py-4)
      <header className="bg-gray-800 text-white py-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
          <Link href="/" className="text-3xl font-bold flex items-center">
            <img 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" // Usando imagem da PokeAPI
              alt="Pokébola" 
              className="h-8 w-8 mr-2" // Ajustado tamanho
            />
            <span>Pokédex</span>
          </Link>
          <nav className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2">
            {[
              { href: "/", label: "Inicial" }, // Nome mais curto
              { href: "/home", label: "Pokédex" },
              { href: "/tipos", label: "Tipos" },
              { href: "/geracoes", label: "Gerações" },
              { href: "/habitats", label: "Habitats" },
              { href: "/regioes", label: "Regiões" },
              { href: "/habilidades", label: "Habilidades" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                // Removido text-white (herdado do header), ajustado hover e padding
                className="font-semibold hover:text-pokeRed transition-colors duration-200 px-2 py-1 rounded"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    );
}

