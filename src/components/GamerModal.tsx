import React, { useState, useEffect } from 'react';
import { X, Gamepad2, Hourglass, Tag, Calendar, UserPlus, Plus } from 'lucide-react';
import { Gamer, GameCategory } from '../types';

interface GamerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gamer: Omit<Gamer, 'id'> & { id?: string }) => void;
  onAddCategory: (categoryName: string) => void;
  editingGamer?: Gamer | null;
  categories: string[];
  primaryColor?: string;
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
  };
}

export default function GamerModal({
  isOpen,
  onClose,
  onSave,
  onAddCategory,
  editingGamer,
  categories,
  primaryColor,
  colorsSet
}: GamerModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(20);
  const [preferredGame, setPreferredGame] = useState('');
  const [category, setCategory] = useState<GameCategory>('');
  const [dailyFreeTime, setDailyFreeTime] = useState<number>(4);
  const [error, setError] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (editingGamer) {
      setName(editingGamer.name);
      setAge(editingGamer.age);
      setPreferredGame(editingGamer.preferredGame);
      setCategory(editingGamer.category);
      setDailyFreeTime(editingGamer.dailyFreeTime);
    } else {
      setName('');
      setAge(21);
      setPreferredGame('');
      setCategory(categories.length > 0 ? categories[0] : '');
      setDailyFreeTime(4);
    }
    setError('');
    setShowNewCategoryInput(false);
    setNewCategoryName('');
  }, [editingGamer, isOpen]);

  if (!isOpen) return null;

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName);
      setCategory(newCategoryName.trim());
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      setError('');
    } else {
      setError('Nome da categoria não pode estar vazio.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome é obrigatório.');
      return;
    }
    if (!preferredGame.trim()) {
      setError('O jogo preferido é obrigatório.');
      return;
    }
    if (!category.trim()) {
      setError('Selecione ou crie uma categoria.');
      return;
    }
    if (age <= 0 || age > 110) {
      setError('Por favor, informe uma idade válida.');
      return;
    }
    if (dailyFreeTime < 0 || dailyFreeTime > 24) {
      setError('O tempo livre deve ser entre 0 e 24 horas por dia.');
      return;
    }

    onSave({
      id: editingGamer?.id,
      name: name.trim(),
      age,
      preferredGame: preferredGame.trim(),
      category: category.trim(),
      dailyFreeTime
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-[#000]/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#cfc2d6]/15 rounded-xl overflow-hidden shadow-2xl z-10 transition-all duration-300">
        
        {/* Decorative Top Accent Line */}
        <div className={`h-1.5 w-full ${colorsSet.primaryBg}`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#cfc2d6]/10">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#201f1f] rounded-lg border border-[#cfc2d6]/10">
              <Gamepad2 className={colorsSet.primaryText} size={20} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-[#e5e2e1]">
                {editingGamer ? 'Editar Gamer' : 'Adicionar Usuário (Gamer)'}
              </h3>
              <p className="text-xs text-[#cfc2d6]/60">
                {editingGamer ? 'Atualize as informações do jogador cadastrado.' : 'Preencha os dados do novo jogador.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#cfc2d6]/50 hover:text-[#e5e2e1] transition-colors p-1.5 rounded-full hover:bg-white/5 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Nome Input */}
          <div className="flex flex-col gap-1.5 group">
            <label className="text-[11px] font-mono font-medium text-[#cfc2d6]/70 uppercase tracking-widest group-focus-within:text-[#f97316] transition-colors">
              Nome de Registro / Nickname
            </label>
            <div className="relative">
              <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40 group-focus-within:${colorsSet.primaryText} transition-colors`}>
                @
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: GhostRider99"
                className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/20 px-3.5 py-3 pl-9 focus:outline-none focus:border-[#f97316] focus:bg-[#201f1f] transition-all duration-300 font-sans text-sm rounded-t placeholder:text-[#cfc2d6]/30 ${colorsSet.borderFocus}`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Idade Input */}
            <div className="flex flex-col gap-1.5 group">
              <label className="text-[11px] font-mono font-medium text-[#cfc2d6]/70 uppercase tracking-widest transition-colors">
                Idade
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                <input
                  type="number"
                  value={age || ''}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  placeholder="Ex: 21"
                  min="5"
                  max="110"
                  className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/20 px-3.5 py-3 pl-9 focus:outline-none transition-all duration-300 font-sans text-sm rounded-t ${colorsSet.borderFocus}`}
                  required
                />
              </div>
            </div>

            {/* Tempo Livre Input */}
            <div className="flex flex-col gap-1.5 group">
              <label className="text-[11px] font-mono font-medium text-[#cfc2d6]/70 uppercase tracking-widest transition-colors">
                Tempo Livre Diário (Horas)
              </label>
              <div className="relative">
                <Hourglass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                <input
                  type="number"
                  value={dailyFreeTime}
                  onChange={(e) => setDailyFreeTime(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 4"
                  min="0"
                  max="24"
                  step="0.5"
                  className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/20 px-3.5 py-3 pl-9 focus:outline-none transition-all duration-300 font-sans text-sm rounded-t ${colorsSet.borderFocus}`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Jogo Preferido Input */}
          <div className="flex flex-col gap-1.5 group">
            <label className="text-[11px] font-mono font-medium text-[#cfc2d6]/70 uppercase tracking-widest transition-colors">
              Jogo Preferido
            </label>
            <div className="relative">
              <Gamepad2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
              <input
                type="text"
                value={preferredGame}
                onChange={(e) => setPreferredGame(e.target.value)}
                placeholder="Ex: League of Legends, CS:GO, Valorant"
                className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/20 px-3.5 py-3 pl-9 focus:outline-none transition-all duration-300 font-sans text-sm rounded-t placeholder:text-[#cfc2d6]/30 ${colorsSet.borderFocus}`}
                required
              />
            </div>
          </div>

          {/* Categoria Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-medium text-[#cfc2d6]/70 uppercase tracking-widest">
              Categoria de Jogo
            </label>
            {showNewCategoryInput ? (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: Estratégia, Puzzle, etc..."
                    className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/20 px-3.5 py-3 pl-9 focus:outline-none transition-all duration-300 font-sans text-sm rounded-t ${colorsSet.borderFocus}`}
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className={`px-3 py-3 rounded font-mono text-xs font-bold text-[#131313] ${colorsSet.primaryBg} transition-all active:scale-95`}
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                    setError('');
                  }}
                  className="px-3 py-3 rounded font-mono text-xs font-bold text-[#cfc2d6] hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GameCategory)}
                    className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/20 px-3.5 py-3 pl-9 focus:outline-none transition-all duration-300 font-sans text-sm rounded-t appearance-none ${colorsSet.borderFocus}`}
                    style={{ contentVisibility: 'auto' }}
                  >
                    <option value="">-- Selecione uma categoria --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#141414] text-[#e5e2e1]">
                        {cat}
                      </option>
                    ))}
                  </select>
                  {/* Custom arrow decoration */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#cfc2d6]/50">
                    ▼
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryInput(true)}
                  className={`px-3 py-3 rounded font-mono text-xs font-bold text-[#131313] flex items-center gap-1 ${colorsSet.primaryBg} transition-all active:scale-95`}
                  title="Criar nova categoria"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#cfc2d6]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded text-xs font-mono font-medium text-[#cfc2d6] hover:bg-white/5 active:scale-95 transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded font-mono text-xs font-medium uppercase tracking-wider text-[#131313] flex items-center gap-2 transition-all active:scale-95 ${colorsSet.primaryBg} ${colorsSet.glowClass} font-bold`}
            >
              <UserPlus size={14} />
              {editingGamer ? 'SALVAR ALTERAÇÕES' : 'CRIAR REGISTRO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
