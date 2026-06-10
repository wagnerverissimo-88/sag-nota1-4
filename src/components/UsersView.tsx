import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Search, UserPlus, Filter, ChevronLeft, ChevronRight, CornerDownRight } from 'lucide-react';
import { Gamer, GameCategory } from '../types';

interface UsersViewProps {
  gamers: Gamer[];
  categories: string[];
  onAddGamerClick: () => void;
  onEditGamerClick: (gamer: Gamer) => void;
  onDeleteGamerClick: (id: string) => void;
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
  };
}

export default function UsersView({
  gamers,
  categories,
  onAddGamerClick,
  onEditGamerClick,
  onDeleteGamerClick,
  colorsSet
}: UsersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'ALL'>('ALL');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter & Search Logic
  const filteredGamers = gamers.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.preferredGame.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalItems = filteredGamers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGamers = filteredGamers.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDropdownId === id) {
      setActiveDropdownId(null);
    } else {
      setActiveDropdownId(id);
    }
  };

  // Close dropdown on clicking outside
  React.useEffect(() => {
    const closeAll = () => setActiveDropdownId(null);
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Page Header (Title + Add Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfc2d6]/10 pb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#e5e2e1] tracking-tight mb-2">
            Lista de Gamers
          </h2>
          <p className="text-[#cfc2d6]/60 text-xs md:text-sm">
            Gerencie os jogadores cadastrados no sistema, altere dados e controle o banco de dados.
          </p>
        </div>
        
        <button
          onClick={onAddGamerClick}
          className={`px-5 py-3 rounded-lg font-mono text-xs font-bold text-[#131313] flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap self-start sm:self-center ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
        >
          <UserPlus size={16} />
          Adicionar Usuários
        </button>
      </div>

      {/* Filters Hub (Search + Category Filter Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40 group-focus-within:text-[#f97316] transition-colors" size={16} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou jogo preferido..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset pagination
            }}
            className="w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3 pl-10 focus:outline-none focus:bg-[#201f1f] focus:border-[#f97316] font-sans text-xs rounded transition-all duration-300 placeholder:text-[#cfc2d6]/30"
          />
        </div>

        {/* Category selector */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={14} />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value as string | 'ALL');
              setCurrentPage(1); // reset pagination
            }}
            className="w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3 pl-9 focus:outline-none focus:border-[#f97316] font-mono text-xs rounded appearance-none transition-all cursor-pointer"
            style={{ contentVisibility: 'auto' }}
          >
            <option value="ALL">TODAS CATEGORIAS</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#cfc2d6]/40 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Category Pills shortcut */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-mono text-[#cfc2d6]/40 uppercase tracking-widest mr-1">Filtrar por:</span>
        <button
          onClick={() => {
            setSelectedCategory('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all duration-200 uppercase tracking-wide border ${
            selectedCategory === 'ALL' 
              ? 'bg-[#e5e2e1]/10 text-[#e5e2e1] border-[#cfc2d6]/30 font-bold' 
              : 'bg-transparent text-[#cfc2d6]/50 border-transparent hover:text-[#e5e2e1] hover:bg-white/5'
          }`}
        >
          Todos
        </button>
        {categories.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setSelectedCategory(tab);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all duration-200 uppercase tracking-wide border ${
              selectedCategory === tab 
                ? 'bg-[#e5e2e1]/10 text-[#e5e2e1] border-[#cfc2d6]/30 font-bold' 
                : 'bg-transparent text-[#cfc2d6]/50 border-transparent hover:text-[#e5e2e1] hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Gamers Table Container (Glassmorphic theme edge) */}
      <div className="bg-[#201f1f]/35 backdrop-blur-[12px] rounded-xl border border-[#cfc2d6]/15 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#cfc2d6]/15 bg-[#2a2a2a]/45">
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Nome</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Idade</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Jogo Preferido</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Categoria</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest">Tempo Livre</th>
                <th className="py-4 px-6 font-mono text-[11px] text-[#cfc2d6]/60 font-bold uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#cfc2d6]/5">
              {paginatedGamers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center text-sm text-[#cfc2d6]/40 font-mono">
                    Nenhum jogador encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                paginatedGamers.map((gamer) => {
                  const initial = gamer.name ? gamer.name.charAt(0).toUpperCase() : 'G';
                  
                  return (
                    <tr 
                      key={gamer.id} 
                      className="hover:bg-[#201f1f]/50 transition-colors group"
                    >
                      {/* Name with custom gamer indicator */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#cfc2d6]/15 flex items-center justify-center font-bold text-sm ${colorsSet.primaryText} transition-all group-hover:scale-105 duration-200 shadow-md`}>
                            {initial}
                          </div>
                          <span className="font-display text-sm font-semibold text-[#e5e2e1] group-hover:text-primary transition-colors">
                            {gamer.name}
                          </span>
                        </div>
                      </td>

                      {/* Age */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-[#cfc2d6]/80 font-medium">
                          {gamer.age} anos
                        </span>
                      </td>

                      {/* Preferred Game */}
                      <td className="py-4 px-6">
                        <span className="text-sm font-sans text-[#cfc2d6]/90 font-medium">
                          {gamer.preferredGame}
                        </span>
                      </td>

                      {/* Category with badge color system */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono border uppercase tracking-wider ${getCategoryBadgeStyle(gamer.category)}`}>
                          {gamer.category}
                        </span>
                      </td>

                      {/* Daily Free Time formatted */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono text-[#cfc2d6]/80">
                          {gamer.dailyFreeTime} hora{gamer.dailyFreeTime !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Action Dropdown Menu */}
                      <td className="py-4 px-6 text-right relative">
                        <button
                          onClick={(e) => toggleDropdown(gamer.id, e)}
                          className="text-[#cfc2d6]/60 hover:text-[#e5e2e1] hover:bg-white/5 rounded-md p-1.5 transition-colors cursor-pointer inline-flex items-center"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Box */}
                        {activeDropdownId === gamer.id && (
                          <div className="absolute right-6 top-12 w-40 bg-[#1A1A1A] border border-[#cfc2d6]/20 rounded-lg shadow-2xl z-20 overflow-hidden font-mono text-xs text-left animate-in fade-in duration-150">
                            <button
                              onClick={() => onEditGamerClick(gamer)}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-[#cfc2d6] hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-colors"
                            >
                              <Edit size={14} className={colorsSet.primaryText} />
                              <span>EDITAR GAMER</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteGamerClick(gamer.id);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-[#cfc2d6]/5"
                            >
                              <Trash2 size={14} />
                              <span>EXCLUIR JOGADOR</span>
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

        {/* Dynamic Pagination Footer */}
        <div className="border-t border-[#cfc2d6]/15 px-6 py-4 flex items-center justify-between bg-[#141414]">
          <p className="text-xs text-[#cfc2d6]/50 font-mono">
            Exibindo <span className="text-[#e5e2e1] font-bold">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-[#e5e2e1] font-bold">{totalItems}</span> jogadores
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

// Map categories to modern stylized badge themes (dynamic based on hash)
function getCategoryBadgeStyle(category: string): string {
  // Generate a hash from category name
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
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
