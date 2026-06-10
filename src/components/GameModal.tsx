import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Loader2, AlertTriangle, Gamepad2, Star, Monitor, Save } from 'lucide-react';
import { Game, RawgGame } from '../types';

// ─── RAWG API Config ────────────────────────────────────────────────────────
// Defina VITE_RAWG_API_KEY no seu arquivo .env (veja .env.example)
// Formato oficial da RAWG: GET https://api.rawg.io/api/games?key=YOUR_API_KEY
// Cadastro gratuito em: https://rawg.io/apimgmt
const RAWG_KEY = import.meta.env.VITE_RAWG_API_KEY;
const RAWG_BASE = 'https://api.rawg.io/api';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: Omit<Game, 'id'>) => void;
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
  };
}

type SearchStatus = 'idle' | 'loading' | 'done' | 'error' | 'no-key';

export default function GameModal({ isOpen, onClose, onSave, colorsSet }: GameModalProps) {
  // Form field states
  const [nameInput, setNameInput] = useState('');
  const [selected, setSelected] = useState<RawgGame | null>(null);

  // Autocomplete states
  const [suggestions, setSuggestions] = useState<RawgGame[]>([]);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Refs
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setNameInput('');
      setSelected(null);
      setSuggestions([]);
      setSearchStatus('idle');
      setIsDropdownOpen(false);
    } else {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Debounced RAWG search
  const handleNameChange = useCallback((value: string) => {
    setNameInput(value);
    setSelected(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setSearchStatus('idle');
      setIsDropdownOpen(false);
      return;
    }

    if (!RAWG_KEY) {
      setSearchStatus('no-key');
      setIsDropdownOpen(false);
      return;
    }

    setSearchStatus('loading');

    debounceRef.current = setTimeout(async () => {
      try {
        // Formato oficial RAWG: GET /api/games?key=KEY&search=TERM
        const url = `${RAWG_BASE}/games?key=${RAWG_KEY}&search=${encodeURIComponent(value.trim())}&page_size=7&ordering=-rating`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`RAWG ${res.status}`);
        const data = await res.json();
        setSuggestions(data.results ?? []);
        setSearchStatus('done');
        setIsDropdownOpen(true);
      } catch (err) {
        console.error('[RAWG] Erro na busca:', err);
        setSuggestions([]);
        setSearchStatus('error');
        setIsDropdownOpen(false);
      }
    }, 400);
  }, []);

  // Select a suggestion from the dropdown
  const handleSelectSuggestion = (rawgGame: RawgGame) => {
    setSelected(rawgGame);
    setNameInput(rawgGame.name);
    setIsDropdownOpen(false);
    setSuggestions([]);
    setSearchStatus('idle');
  };

  // Build game object and save
  const handleSave = () => {
    if (!nameInput.trim()) return;

    const gameData: Omit<Game, 'id'> = {
      name: nameInput.trim(),
      genre: selected?.genres?.[0]?.name ?? '',
      platforms: selected?.platforms?.map((p) => p.platform.name) ?? [],
      rating: selected?.rating ?? null,
      releaseYear: selected?.released ? new Date(selected.released).getFullYear() : null,
      coverUrl: selected?.background_image ?? null,
      rawgId: selected?.id ?? null,
    };

    onSave(gameData);
  };

  const canSave = nameInput.trim().length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-lg bg-[#1A1A1A] border border-[#cfc2d6]/20 rounded-2xl shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-250"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#cfc2d6]/10">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-[#2a2a2a] border border-[#cfc2d6]/15 flex items-center justify-center ${colorsSet.primaryText}`}>
                <Gamepad2 size={16} />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-[#e5e2e1] tracking-tight leading-none">
                  Adicionar Jogo
                </h3>
                <p className="text-[10px] text-[#cfc2d6]/40 font-mono mt-0.5">
                  Busque por nome e selecione da base RAWG
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#cfc2d6]/50 hover:text-[#e5e2e1] hover:bg-white/5 rounded-lg p-1.5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 flex flex-col gap-5">

            {/* Game name field with autocomplete */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#cfc2d6]/50 uppercase tracking-widest mb-2">
                Nome do Jogo *
              </label>

              <div className="relative" ref={dropdownRef}>
                {/* Input */}
                <div className="relative group">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40 group-focus-within:text-[#f97316] transition-colors pointer-events-none"
                    size={15}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={nameInput}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setIsDropdownOpen(true);
                    }}
                    placeholder={
                      RAWG_KEY
                        ? 'Digite para buscar jogos (ex: The Witcher 3)...'
                        : 'Digite o nome do jogo manualmente...'
                    }
                    className="w-full bg-[#141414] text-[#e5e2e1] border border-[#cfc2d6]/15 rounded-lg px-4 py-3 pl-10 pr-10 text-sm font-sans focus:outline-none focus:border-[#f97316] focus:bg-[#1e1e1e] transition-all duration-200 placeholder:text-[#cfc2d6]/30"
                  />
                  {/* Status icon on right */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {searchStatus === 'loading' && (
                      <Loader2 size={15} className="text-[#cfc2d6]/50 animate-spin" />
                    )}
                    {searchStatus === 'error' && (
                      <AlertTriangle size={15} className="text-red-400" />
                    )}
                  </div>
                </div>

                {/* No API key warning */}
                {searchStatus === 'no-key' && (
                  <p className="mt-1.5 text-[10px] font-mono text-amber-400/80 flex items-center gap-1.5">
                    <AlertTriangle size={11} />
                    <span>
                      Variável <code className="font-bold">VITE_RAWG_API_KEY</code> não configurada.
                      Cadastrando manualmente.
                    </span>
                  </p>
                )}

                {/* Autocomplete Dropdown */}
                {isDropdownOpen && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#141414] border border-[#cfc2d6]/20 rounded-xl shadow-2xl z-10 overflow-hidden max-h-72 overflow-y-auto">
                    <p className="px-4 py-2 text-[9px] font-mono text-[#cfc2d6]/30 uppercase tracking-widest border-b border-[#cfc2d6]/10">
                      {suggestions.length} resultado{suggestions.length !== 1 ? 's' : ''} — Fonte: RAWG
                    </p>
                    {suggestions.map((game) => (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(game)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#201f1f] text-left transition-colors border-b border-[#cfc2d6]/5 last:border-0 cursor-pointer group/item"
                      >
                        {/* Thumbnail */}
                        {game.background_image ? (
                          <img
                            src={game.background_image}
                            alt={game.name}
                            className="w-12 h-9 rounded-md object-cover border border-[#cfc2d6]/10 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-9 rounded-md bg-[#2a2a2a] border border-[#cfc2d6]/10 shrink-0 flex items-center justify-center">
                            <Gamepad2 size={14} className="text-[#cfc2d6]/30" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display font-semibold text-[#e5e2e1] truncate group-hover/item:text-white transition-colors">
                            {game.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {game.genres?.length > 0 && (
                              <span className="text-[10px] font-mono text-[#cfc2d6]/50 truncate">
                                {game.genres.slice(0, 2).map((g) => g.name).join(', ')}
                              </span>
                            )}
                            {game.released && (
                              <span className="text-[10px] font-mono text-[#cfc2d6]/40 shrink-0">
                                {new Date(game.released).getFullYear()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating badge */}
                        {game.rating > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="text-[11px] font-mono font-bold text-amber-400">
                              {game.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Card (after selecting a game) */}
            {selected && (
              <div className="flex gap-4 p-4 rounded-xl bg-[#141414] border border-[#cfc2d6]/10 animate-in fade-in slide-in-from-top-2 duration-200">
                {selected.background_image && (
                  <img
                    src={selected.background_image}
                    alt={selected.name}
                    className="w-20 h-16 rounded-lg object-cover border border-[#cfc2d6]/15 shrink-0 shadow-md"
                  />
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                  <p className={`text-xs font-mono font-bold ${colorsSet.primaryText} uppercase tracking-wider`}>
                    Jogo selecionado ✓
                  </p>
                  <p className="font-display text-sm font-bold text-[#e5e2e1] truncate">
                    {selected.name}
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {selected.genres?.[0] && (
                      <span className="text-[10px] font-mono text-[#cfc2d6]/60">
                        {selected.genres[0].name}
                      </span>
                    )}
                    {selected.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {selected.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {selected.platforms && selected.platforms.length > 0 && (
                      <div className="flex items-center gap-1 text-[#cfc2d6]/50">
                        <Monitor size={10} />
                        <span className="text-[10px] font-mono">
                          {selected.platforms
                            .slice(0, 3)
                            .map((p) => p.platform.name)
                            .join(', ')}
                          {selected.platforms.length > 3 && ` +${selected.platforms.length - 3}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#cfc2d6]/15 text-[#cfc2d6]/70 hover:text-[#e5e2e1] hover:bg-white/5 font-mono text-xs font-bold transition-all cursor-pointer"
            >
              CANCELAR
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold text-[#131313] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
            >
              <Save size={14} />
              SALVAR JOGO
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
