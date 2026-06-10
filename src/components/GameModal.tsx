import React, { useState, useEffect, useRef } from 'react';
import { X, Gamepad2, Save, Star } from 'lucide-react';
import { Game } from '../types';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: Omit<Game, 'id'>) => void;
  editingGame?: Game | null;
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
  };
}

const RATING_OPTIONS = [
  { value: 10, label: '10 — Obra-prima' },
  { value: 9,  label: '9 — Excelente' },
  { value: 8,  label: '8 — Muito bom' },
  { value: 7,  label: '7 — Bom' },
  { value: 6,  label: '6 — Ok' },
  { value: 5,  label: '5 — Mediano' },
  { value: 4,  label: '4 — Fraco' },
  { value: 3,  label: '3 — Ruim' },
  { value: 2,  label: '2 — Muito ruim' },
  { value: 1,  label: '1 — Péssimo' },
];

export default function GameModal({
  isOpen,
  onClose,
  onSave,
  editingGame,
  colorsSet,
}: GameModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'name', string>>>({});

  const nameRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setCategory('');
      setRating(null);
      setNotes('');
      setErrors({});
    } else if (editingGame) {
      setName(editingGame.name);
      setCategory(editingGame.category);
      setRating(editingGame.rating);
      setNotes(editingGame.notes);
    } else {
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [isOpen, editingGame]);

  const validate = () => {
    const newErrors: Partial<Record<'name', string>> = {};
    if (!name.trim()) newErrors.name = 'O nome do jogo é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      category: category.trim(),
      rating,
      notes: notes.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) handleSave();
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!editingGame;

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
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#cfc2d6]/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg bg-[#2a2a2a] border border-[#cfc2d6]/15 flex items-center justify-center ${colorsSet.primaryText}`}
              >
                <Gamepad2 size={16} />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-[#e5e2e1] tracking-tight leading-none">
                  {isEditing ? 'Editar Jogo' : 'Adicionar Jogo'}
                </h3>
                <p className="text-[10px] text-[#cfc2d6]/40 font-mono mt-0.5">
                  {isEditing ? 'Altere os dados do jogo' : 'Preencha os dados do jogo manualmente'}
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

          {/* Body */}
          <div className="p-6 flex flex-col gap-5">

            {/* Nome do Jogo */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#cfc2d6]/50 uppercase tracking-widest mb-2">
                Nome do Jogo *
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="Ex: Elden Ring, God of War, FIFA 25..."
                className={`w-full bg-[#141414] text-[#e5e2e1] border rounded-lg px-4 py-3 text-sm font-sans focus:outline-none focus:bg-[#1e1e1e] transition-all duration-200 placeholder:text-[#cfc2d6]/30 ${
                  errors.name
                    ? 'border-red-500/60 focus:border-red-500'
                    : 'border-[#cfc2d6]/15 focus:border-[#f97316]'
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-[11px] font-mono text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#cfc2d6]/50 uppercase tracking-widest mb-2">
                Categoria / Gênero
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: RPG, FPS, Aventura, Esporte..."
                className="w-full bg-[#141414] text-[#e5e2e1] border border-[#cfc2d6]/15 rounded-lg px-4 py-3 text-sm font-sans focus:outline-none focus:bg-[#1e1e1e] focus:border-[#f97316] transition-all duration-200 placeholder:text-[#cfc2d6]/30"
              />
            </div>

            {/* Nota */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#cfc2d6]/50 uppercase tracking-widest mb-2">
                Nota (0–10)
              </label>
              <div className="relative">
                <Star
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none"
                />
                <select
                  value={rating ?? ''}
                  onChange={(e) =>
                    setRating(e.target.value === '' ? null : Number(e.target.value))
                  }
                  className="w-full bg-[#141414] text-[#e5e2e1] border border-[#cfc2d6]/15 rounded-lg px-4 py-3 pl-9 text-sm font-mono focus:outline-none focus:bg-[#1e1e1e] focus:border-[#f97316] transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Sem nota</option>
                  {RATING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#cfc2d6]/40 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Notas Extras */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#cfc2d6]/50 uppercase tracking-widest mb-2">
                Observações / Notas Extras
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Impressões, onde parou, dicas, links... escreva o que quiser."
                rows={4}
                className="w-full bg-[#141414] text-[#e5e2e1] border border-[#cfc2d6]/15 rounded-lg px-4 py-3 text-sm font-sans focus:outline-none focus:bg-[#1e1e1e] focus:border-[#f97316] transition-all duration-200 placeholder:text-[#cfc2d6]/30 resize-none"
              />
              <p className="mt-1 text-[10px] font-mono text-[#cfc2d6]/30 text-right">
                {notes.length} caracteres
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            <p className="text-[10px] font-mono text-[#cfc2d6]/30">
              Ctrl + Enter para salvar
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-[#cfc2d6]/15 text-[#cfc2d6]/70 hover:text-[#e5e2e1] hover:bg-white/5 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={handleSave}
                className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold text-[#131313] flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
              >
                <Save size={14} />
                {isEditing ? 'SALVAR EDIÇÃO' : 'SALVAR JOGO'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
