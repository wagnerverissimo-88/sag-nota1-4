import React, { useState } from 'react';
import { X, Trash2, Tag, Plus } from 'lucide-react';
import { Gamer } from '../types';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  gamers: Gamer[];
  onDeleteCategory: (categoryName: string) => void;
  onAddCategory: (categoryName: string) => void;
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
  };
}

export default function CategoriesModal({
  isOpen,
  onClose,
  categories,
  gamers,
  onDeleteCategory,
  onAddCategory,
  colorsSet
}: CategoriesModalProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Count gamers per category
  const getCategoryCount = (categoryName: string) => {
    return gamers.filter(g => g.category === categoryName).length;
  };

  const handleDeleteClick = (categoryName: string) => {
    const count = getCategoryCount(categoryName);
    if (count > 0) {
      setConfirmDelete(categoryName);
    } else {
      onDeleteCategory(categoryName);
      setConfirmDelete(null);
    }
  };

  const confirmAndDelete = (categoryName: string) => {
    onDeleteCategory(categoryName);
    setConfirmDelete(null);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      setError('');
    } else {
      setError('Nome da categoria não pode estar vazio.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-[#000]/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#141414] border border-[#cfc2d6]/15 rounded-xl overflow-hidden shadow-2xl z-10">
        
        {/* Decorative Top Accent Line */}
        <div className={`h-1.5 w-full ${colorsSet.primaryBg}`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#cfc2d6]/10">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#201f1f] rounded-lg border border-[#cfc2d6]/10">
              <Tag className={colorsSet.primaryText} size={20} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-[#e5e2e1]">
                Gerenciar Categorias
              </h3>
              <p className="text-xs text-[#cfc2d6]/60">
                Visualize, adicione e remova categorias
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowNewCategoryInput(true)}
              className={`${colorsSet.primaryBg} text-[#131313] p-2 rounded-lg hover:opacity-90 transition-all active:scale-95`}
              title="Criar nova categoria"
            >
              <Plus size={18} />
            </button>
            <button 
              onClick={onClose}
              className="text-[#cfc2d6]/50 hover:text-[#e5e2e1] transition-colors p-1.5 rounded-full hover:bg-white/5 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r text-red-400 text-xs mb-4">
              {error}
            </div>
          )}

          {showNewCategoryInput && (
            <div className="mb-4 flex gap-2">
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
          )}

          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#cfc2d6]/60 text-sm mb-4">
                Nenhuma categoria criada ainda.
              </p>
              <button
                onClick={() => setShowNewCategoryInput(true)}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold text-[#131313] ${colorsSet.primaryBg} transition-all active:scale-95 inline-flex items-center gap-2`}
              >
                <Plus size={14} />
                Criar Primeira Categoria
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
              {categories.map((category) => {
                const gamersCount = getCategoryCount(category);
                const isConfirming = confirmDelete === category;

                return (
                  <div
                    key={category}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isConfirming
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-[#1A1A1A] border-[#cfc2d6]/10 hover:border-[#cfc2d6]/20'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-[#e5e2e1]">
                        {category}
                      </p>
                      <p className={`text-xs ${gamersCount > 0 ? 'text-[#cfc2d6]/70' : 'text-[#cfc2d6]/50'}`}>
                        {gamersCount} gamer{gamersCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {isConfirming ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => confirmAndDelete(category)}
                          className="px-3 py-1.5 rounded text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-700 transition-colors active:scale-95"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 rounded text-xs font-mono font-bold text-[#cfc2d6] hover:bg-white/5 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="text-[#cfc2d6]/60 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                        title={`Deletar categoria ${category}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#cfc2d6]/10 p-6 flex justify-end gap-3 bg-[#0e0e0e]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-mono text-xs font-bold text-[#cfc2d6] hover:bg-white/5 transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
