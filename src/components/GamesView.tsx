import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Star,
  Gamepad2,
  Monitor,
} from 'lucide-react';
import { Game } from '../types';

interface GamesViewProps {
  games: Game[];
  onAddGameClick: () => void;
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
  onDeleteGameClick,
  colorsSet,
}: GamesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtro local por nome
  const filteredGames = games.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalItems = filteredGames.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex-1 flex flex-col gap-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfc2d6]/10 pb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#e5e2e1] tracking-tight mb-2">
            Biblioteca de Jogos
          </h2>
          <p className="text-[#cfc2d6]/60 text-xs md:text-sm">
            Gerencie os jogos eletrônicos cadastrados no sistema via busca inteligente.
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

      {/* Search Bar */}
      <div className="relative group max-w-xl">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40 group-focus-within:text-[#f97316] transition-colors"
          size={16}
        />
        <input
          type="text"
          placeholder="Pesquisar na sua biblioteca..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3 pl-10 focus:outline-none focus:bg-[#201f1f] focus:border-[#f97316] font-sans text-xs rounded transition-all duration-300 placeholder:text-[#cfc2d6]/30"
        />
      </div>

      {/* Games Table */}
      <div className="bg-[#201f1f]/35 backdrop-blur-[12px] rounded-xl border border-[#cfc2d6]/15 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#cfc2d6]/15 bg-[#2a2a2a]/45">
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">
                  Jogo
                </th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">
                  Gênero
                </th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">
                  Plataformas
                </th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">
                  Nota
                </th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">
                  Ano
                </th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#cfc2d6]/5">
              {paginatedGames.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 px-6 text-center">
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
                paginatedGames.map((game) => (
                  <tr
                    key={game.id}
                    className="hover:bg-[#201f1f]/50 transition-colors group"
                  >
                    {/* Cover + Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {game.coverUrl ? (
                          <img
                            src={game.coverUrl}
                            alt={game.name}
                            className="w-10 h-10 rounded-md object-cover border border-[#cfc2d6]/15 shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-md"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-md bg-[#1A1A1A] border border-[#cfc2d6]/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 ${colorsSet.primaryText}`}
                          >
                            <Gamepad2 size={18} />
                          </div>
                        )}
                        <span className="font-display text-sm font-semibold text-[#e5e2e1] line-clamp-1">
                          {game.name}
                        </span>
                      </div>
                    </td>

                    {/* Genre */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-mono text-[#cfc2d6]/80">
                        {game.genre || '—'}
                      </span>
                    </td>

                    {/* Platforms */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {game.platforms.length > 0 ? (
                          game.platforms.slice(0, 3).map((p) => (
                            <span
                              key={p}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#2a2a2a] border border-[#cfc2d6]/10 text-[#cfc2d6]/70"
                            >
                              <Monitor size={9} />
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-mono text-[#cfc2d6]/40">—</span>
                        )}
                        {game.platforms.length > 3 && (
                          <span className="text-[10px] font-mono text-[#cfc2d6]/40">
                            +{game.platforms.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-6">
                      {game.rating !== null ? (
                        <div className="flex items-center gap-1.5">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            {game.rating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-[#cfc2d6]/40">—</span>
                      )}
                    </td>

                    {/* Year */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-mono text-[#cfc2d6]/80">
                        {game.releaseYear ?? '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onDeleteGameClick(game.id)}
                        className="text-[#cfc2d6]/40 hover:text-red-400 hover:bg-red-500/10 rounded-md p-1.5 transition-colors cursor-pointer inline-flex items-center"
                        title="Remover jogo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
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
