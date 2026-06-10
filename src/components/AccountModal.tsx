import React, { useState, useEffect } from 'react';
import { X, User, Settings, Check, Palette, Eye } from 'lucide-react';
import { UserAccount, UserPreferences } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateUser: (updated: UserAccount) => void;
  initialTab?: 'ACCOUNT' | 'PREFS';
}

const COLOR_OPTIONS: { value: UserPreferences['primaryColor']; label: string; colorClass: string; hex: string }[] = [
  { value: 'orange', label: 'Laranja Neon', colorClass: 'bg-[#f97316]', hex: '#f97316' },
  { value: 'purple', label: 'Roxo Elétrico', colorClass: 'bg-[#ddb7ff]', hex: '#ddb7ff' },
  { value: 'cyan', label: 'Ciano Cyber', colorClass: 'bg-[#4cd7f6]', hex: '#4cd7f6' },
  { value: 'magenta', label: 'Magenta Stream', colorClass: 'bg-[#ec4899]', hex: '#ec4899' },
  { value: 'green', label: 'Verde Ácido', colorClass: 'bg-[#91db2a]', hex: '#91db2a' }
];

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
];

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  initialTab = 'ACCOUNT'
}: AccountModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'ACCOUNT' | 'PREFS'>(initialTab);
  
  // Account Form state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('');
  
  // Preferences State
  const [primaryColor, setPrimaryColor] = useState<UserPreferences['primaryColor']>(currentUser.preferences.primaryColor);
  const [bgPattern, setBgPattern] = useState(currentUser.preferences.bgPattern);
  const [avatarSelection, setAvatarSelection] = useState(currentUser.preferences.avatarSelection);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPassword('');
    setPrimaryColor(currentUser.preferences.primaryColor);
    setBgPattern(currentUser.preferences.bgPattern);
    setAvatarSelection(currentUser.preferences.avatarSelection);
    setMessage('');
    setActiveSubTab(initialTab);
  }, [currentUser, isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      email,
      ...(password ? { password } : {})
    });
    setMessage('Perfil updated com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSavePreferences = () => {
    onUpdateUser({
      ...currentUser,
      avatarUrl: avatarSelection,
      preferences: {
        primaryColor,
        bgPattern,
        avatarSelection
      }
    });
    setMessage('Preferências salvas com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Container */}
      <div className="relative w-full max-w-lg bg-[#141414] border border-[#cfc2d6]/15 rounded-xl overflow-hidden shadow-2xl z-10">
        
        {/* Top visual helper color */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#f97316] via-[#ddb7ff] to-[#4cd7f6]" />

        {/* Header */}
        <div className="p-6 border-b border-[#cfc2d6]/10 flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <span className="p-2 bg-[#201f1f] rounded-lg border border-[#cfc2d6]/10 text-primary">
              <Settings size={20} className="text-[#f97316]" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-[#e5e2e1]">Configurações da Conta</h3>
              <p className="text-xs text-[#cfc2d6]/60">Customize seu perfil de acesso e preferências do workspace.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#cfc2d6]/50 hover:text-[#e5e2e1] p-1.5 rounded-full hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector bar */}
        <div className="flex border-b border-[#cfc2d6]/10">
          <button
            onClick={() => { setActiveSubTab('ACCOUNT'); setMessage(''); }}
            className={`flex-1 py-3 text-center text-xs font-mono font-medium border-b-2 tracking-wider ${
              activeSubTab === 'ACCOUNT' 
                ? 'border-[#f97316] text-[#e5e2e1] bg-[#1a1a1a]/40 font-bold' 
                : 'border-transparent text-[#cfc2d6]/40 hover:text-[#e5e2e1]'
            }`}
          >
            EDITAR MINHA CONTA
          </button>
          <button
            onClick={() => { setActiveSubTab('PREFS'); setMessage(''); }}
            className={`flex-1 py-3 text-center text-xs font-mono font-medium border-b-2 tracking-wider ${
              activeSubTab === 'PREFS' 
                ? 'border-[#f97316] text-[#e5e2e1] bg-[#1a1a1a]/40 font-bold' 
                : 'border-transparent text-[#cfc2d6]/40 hover:text-[#e5e2e1]'
            }`}
          >
            PREFERÊNCIAS VISUAIS
          </button>
        </div>

        {/* Alert message status handler */}
        {message && (
          <div className="mx-6 mt-4 bg-emerald-500/10 border-l-2 border-emerald-500 p-3 rounded-r text-[#91db2a] text-xs font-mono">
            {message}
          </div>
        )}

        {/* Sub-tab: EDIT ACCOUNT */}
        {activeSubTab === 'ACCOUNT' && (
          <form onSubmit={handleSaveAccount} className="p-6 flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-[#cfc2d6]/60 uppercase tracking-widest">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-2.5 focus:outline-none focus:border-[#f97316] font-sans text-sm rounded transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-[#cfc2d6]/60 uppercase tracking-widest">Endereço de E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-2.5 focus:outline-none focus:border-[#f97316] font-sans text-sm rounded transition-all"
              />
            </div>

            {/* Password change info */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-[#cfc2d6]/60 uppercase tracking-widest">Nova Senha (opcional)</label>
              <input
                type="password"
                placeholder="Deixe em branco para manter a senha atual"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-2.5 focus:outline-none focus:border-[#f97316] font-sans text-sm rounded transition-all placeholder:text-[#cfc2d6]/30"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#cfc2d6]/5 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-mono font-medium text-[#cfc2d6] hover:bg-white/5 rounded transition-all"
              >
                FECHAR
              </button>
              <button
                type="submit"
                className="bg-[#f97316] hover:bg-orange-600 active:scale-95 text-[#131313] px-6 py-2.5 rounded font-mono text-xs font-bold transition-all shadow-md mt-auto"
              >
                SALVAR ALTERAÇÕES
              </button>
            </div>
          </form>
        )}

        {/* Sub-tab: PREFERENCES */}
        {activeSubTab === 'PREFS' && (
          <div className="p-6 flex flex-col gap-6">
            
            {/* Color Accent Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-[#cfc2d6]/60 uppercase tracking-widest flex items-center gap-1.5">
                <Palette size={12} className="text-[#f97316]" />
                Cor Primária de Acento (Tema G-CORE)
              </label>
              <p className="text-[11px] text-[#cfc2d6]/50">Altere instantaneamente as cores dos botões, menus, glows e foco do app.</p>
              
              <div className="grid grid-cols-5 gap-2 mt-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPrimaryColor(opt.value)}
                    className={`flex flex-col items-center gap-2 p-2.5 rounded-lg border transition-all relative ${
                      primaryColor === opt.value 
                        ? 'border-[#e5e2e1]/30 bg-[#1A1A1A] font-medium' 
                        : 'border-[#cfc2d6]/10 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full ${opt.colorClass} border border-black/30 shadow-inner flex items-center justify-center`}>
                      {primaryColor === opt.value && <Check size={12} className="text-black font-bold" />}
                    </div>
                    <span className="text-[10px] font-mono text-center text-[#cfc2d6]/80 truncate w-full">{opt.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Avatar custom selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-[#cfc2d6]/60 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} className="text-[#f97316]" />
                Foto do Perfil (Avatar do Jogador)
              </label>
              
              <div className="flex items-center gap-4 mt-2">
                {/* Active preview icon */}
                <div className="w-14 h-14 rounded-full border-2 border-[#f97316] overflow-hidden bg-zinc-800 shrink-0 shadow-lg">
                  <img src={avatarSelection} alt="Preview Avatar" className="w-full h-full object-cover" />
                </div>

                {/* Grid selection list */}
                <div className="flex gap-2.5">
                  {AVATAR_OPTIONS.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setAvatarSelection(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer relative ${
                        avatarSelection === url ? 'border-[#f97316] scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={url} alt={`Selection ${i}`} className="w-full h-full object-cover" />
                      {avatarSelection === url && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check size={14} className="text-[#f97316]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Background texture toggles */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-[#cfc2d6]/60 uppercase tracking-widest flex items-center gap-1.5">
                <Eye size={12} className="text-[#f97316]" />
                Efeitos de Atmosfera
              </label>
              
              <label className="flex items-center gap-3 bg-[#1A1A1A]/40 border border-[#cfc2d6]/10 p-3.5 rounded-lg cursor-pointer hover:bg-[#1A1A1A]/60 transition-all">
                <input
                  type="checkbox"
                  checked={bgPattern}
                  onChange={(e) => setBgPattern(e.target.checked)}
                  className="rounded border-[#cfc2d6]/30 text-[#f97316] focus:ring-0 focus:ring-offset-0 bg-[#121212] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs text-[#e5e2e1] font-mono font-semibold">GRADIENT MATRIX GRID EFFECT</span>
                  <p className="text-[10px] text-[#cfc2d6]/50 mt-0.5">Mostra texturas de cubos e transparências de grade cyberpunk no background.</p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#cfc2d6]/5 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-mono font-medium text-[#cfc2d6] hover:bg-white/5 rounded transition-all"
              >
                FECHAR
              </button>
              <button
                onClick={handleSavePreferences}
                className="bg-[#f97316] hover:bg-orange-600 active:scale-95 text-[#131313] px-6 py-2.5 rounded font-mono text-xs font-bold transition-all shadow-md"
              >
                SALVAR PREFERÊNCIAS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}