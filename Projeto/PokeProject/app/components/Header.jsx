import Link from 'next/link';

export default function Header() {
    return (
      <header className="pokedex-header sticky top-0 z-50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-3xl font-bold flex items-center">
            <img 
              src="https://www.pokemon.com/static-assets/app/static3/img/og-default-image.jpeg" 
              alt="Pokémon Logo" 
              className="h-10 mr-2"
            />
            <span>Pokédex</span>
          </Link>
          <nav className="flex flex-wrap justify-center sm:justify-end gap-4">
            {[
              { href: "/", label: "Página Inicial" },
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
                className="font-semibold text-white hover:text-gray-200 
                           transition-all duration-300
                           rounded-lg px-3 py-2"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    );
}
