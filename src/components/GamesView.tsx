import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Star,
  Gamepad2,
  Edit,
  FileText,
} from 'lucide-react';
import { Game } from '../types';

interface GamesViewProps {
  games: Game[];
  onAddGameClick: () => void;
  onEditGameClick: (game: Game) => void;
  onDeleteGameClick: (id: string) => void;
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
  };
}

export default function GamesView({
  games,
  onAddGameClick,
  onEditGameClick,
  onDeleteGameClick,
  colorsSet,
}: GamesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Filtro local por nome ou categoria
  const filteredGames = games.filter((g) => {
    const term = searchTerm.toLowerCase();
    return (
      g.name.toLowerCase().includes(term) ||
      g.category.toLowerCase().includes(term)
    );
  });

  // Paginação
  const totalItems = filteredGames.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  React.useEffect(() => {
    const closeAll = () => setActiveDropdownId(null);
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfc2d6]/10 pb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#e5e2e1] tracking-tight mb-2">
            Biblioteca de Jogos
          </h2>
          <p className="text-[#cfc2d6]/60 text-xs md:text-sm">
            Registre os jogos da sua coleção com nota e observações personalizadas.
          </p>
        </div>

        <button
          onClick={onAddGameClick}
          className={`px-5 py-3 rounded-lg font-mono text-xs font-bold text-[#131313] flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap self-start sm:self-center ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
        >
          <Plus size={16} />
          Adicionar Jogo
        </button>
      </div>

      {/* Search */}
      <div className="relative group max-w-xl">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40 group-focus-within:text-[#f97316] transition-colors"
          size={16}
        />
        <input
          type="text"
          placeholder="Pesquisar por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3 pl-10 focus:outline-none focus:bg-[#201f1f] focus:border-[#f97316] font-sans text-xs rounded transition-all duration-300 placeholder:text-[#cfc2d6]/30"
        />
      </div>

      {/* Table */}
      <div className="bg-[#201f1f]/35 backdrop-blur-[12px] rounded-xl border border-[#cfc2d6]/15 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#cfc2d6]/15 bg-[#2a2a2a]/45">
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Nome</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Categoria</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Nota</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Observações</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#cfc2d6]/5">
              {paginatedGames.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 px-6 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#cfc2d6]/30">
                      <Gamepad2 size={40} strokeWidth={1} />
                      <p className="text-sm font-mono">
                        {searchTerm
                          ? 'Nenhum jogo encontrado para essa busca.'
                          : 'Sua biblioteca está vazia. Adicione o primeiro jogo!'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedGames.map((game) => {
                  const initial = game.name.charAt(0).toUpperCase();
                  return (
                    <tr key={game.id} className="hover:bg-[#201f1f]/50 transition-colors group">

                      {/* Nome */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#cfc2d6]/15 flex items-center justify-center font-bold text-sm ${colorsSet.primaryText} transition-all group-hover:scale-105 duration-200 shadow-md shrink-0`}>
                            {initial}
                          </div>
                          <span className="font-display text-sm font-semibold text-[#e5e2e1]">
                            {game.name}
                          </span>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-4 px-6">
                        {game.category ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono border uppercase tracking-wider ${getCategoryBadgeStyle(game.category)}`}>
                            {game.category}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[#cfc2d6]/30">—</span>
                        )}
                      </td>

                      {/* Nota */}
                      <td className="py-4 px-6">
                        {game.rating !== null ? (
                          <div className="flex items-center gap-1.5">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-sm font-mono font-bold text-amber-400">
                              {game.rating}
                              <span className="text-[10px] text-amber-400/60 font-normal">/10</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-[#cfc2d6]/30">—</span>
                        )}
                      </td>

                      {/* Observações */}
                      <td className="py-4 px-6 max-w-[220px]">
                        {game.notes ? (
                          <div className="flex items-start gap-1.5">
                            <FileText size={12} className="text-[#cfc2d6]/30 shrink-0 mt-0.5" />
                            <span className="text-xs font-sans text-[#cfc2d6]/70 line-clamp-2">
                              {game.notes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-[#cfc2d6]/30">—</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-6 text-right relative">
                        <button
                          onClick={(e) => toggleDropdown(game.id, e)}
                          className="text-[#cfc2d6]/60 hover:text-[#e5e2e1] hover:bg-white/5 rounded-md p-1.5 transition-colors cursor-pointer inline-flex items-center"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                          </svg>
                        </button>

                        {activeDropdownId === game.id && (
                          <div className="absolute right-6 top-12 w-44 bg-[#1A1A1A] border border-[#cfc2d6]/20 rounded-lg shadow-2xl z-20 overflow-hidden font-mono text-xs text-left animate-in fade-in duration-150">
                            <button
                              onClick={() => onEditGameClick(game)}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-[#cfc2d6] hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-colors"
                            >
                              <Edit size={14} className={colorsSet.primaryText} />
                              <span>EDITAR JOGO</span>
                            </button>
                            <button
                              onClick={() => onDeleteGameClick(game.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-[#cfc2d6]/5"
                            >
                              <Trash2 size={14} />
                              <span>EXCLUIR JOGO</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-[#cfc2d6]/15 px-6 py-4 flex items-center justify-between bg-[#141414]">
          <p className="text-xs text-[#cfc2d6]/50 font-mono">
            Exibindo{' '}
            <span className="text-[#e5e2e1] font-bold">
              {totalItems === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalItems)}
            </span>{' '}
            de <span className="text-[#e5e2e1] font-bold">{totalItems}</span> jogos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-[#cfc2d6]/15 text-[#cfc2d6]/60 hover:bg-white/5 hover:text-[#e5e2e1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs text-[#cfc2d6]/70 min-w-[50px] text-center">
              Pág {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md border border-[#cfc2d6]/15 text-[#cfc2d6]/60 hover:bg-white/5 hover:text-[#e5e2e1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryBadgeStyle(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash = hash & hash;
  }
  const colors = [
    'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'bg-lime-500/10 text-lime-400 border-lime-500/20',
    'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ];
  return colors[Math.abs(hash) % colors.length];
}
