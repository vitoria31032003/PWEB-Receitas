import './globals.css';
import Header from './components/Header'
import Footer from './components/Footer';

export const metadata = {
  title: 'Pokédex - Explore o mundo Pokémon',
  description: 'Explore o mundo Pokémon com nossa Pokédex completa',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
    <body className="bg-white text-gray-800 min-h-screen flex flex-col">
      <Header />
      {children}
      <Footer />
    </body>
  </html>
);
}
