import React, { useState, useEffect } from 'react';
import { Gamepad2, Users, LayoutDashboard, HelpCircle, LogOut, Sliders, Menu, X, Tag, MessageSquare, Trophy } from 'lucide-react';
import { UserAccount, Gamer, Game, ActiveTab } from './types';
import AuthContainer from './components/AuthContainer';
import UsersView from './components/UsersView';
import GamesView from './components/GamesView';
import DashboardView from './components/DashboardView';
import ChatbotView from './components/ChatbotView';
import GamerModal from './components/GamerModal';
import GameModal from './components/GameModal';
import AccountModal from './components/AccountModal';
import CategoriesModal from './components/CategoriesModal';

// Função para limpar dados antigos do localStorage
const cleanupLegacyData = () => {
  const savedGamers = localStorage.getItem('gcore_gamers_db');
  const savedCategories = localStorage.getItem('gcore_categories');
  
  if (savedGamers) {
    try {
      const parsedGamers = JSON.parse(savedGamers);
      // Se há gamers mas nenhuma categoria foi criada, são dados antigos
      if (parsedGamers.length > 0 && (!savedCategories || JSON.parse(savedCategories).length === 0)) {
        console.log('🧹 Limpando dados legados do sistema anterior...');
        localStorage.removeItem('gcore_gamers_db');
      }
    } catch (e) {
      console.error('Erro ao limpar dados antigos:', e);
    }
  }
};

// Limpar dados legados ao carregar o módulo
cleanupLegacyData();

export default function App() {
  // Autenticação
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('gcore_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Categorias criadas pelo usuário
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('gcore_categories');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado do database 
  const [gamers, setGamers] = useState<Gamer[]>(() => {
    const saved = localStorage.getItem('gcore_gamers_db');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado dos jogos cadastrados
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('gcore_games_db');
    return saved ? JSON.parse(saved) : [];
  });

  // App UI Navigation and Panels states
  const [activeTab, setActiveTab] = useState<ActiveTab>('USERS'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Modals management
  const [isGamerModalOpen, setIsGamerModalOpen] = useState(false);
  const [editingGamer, setEditingGamer] = useState<Gamer | null>(null);

  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<'ACCOUNT' | 'PREFS'>('ACCOUNT');

  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Sync gamers to local storage
  useEffect(() => {
    localStorage.setItem('gcore_gamers_db', JSON.stringify(gamers));
  }, [gamers]);

  // Sync games to local storage
  useEffect(() => {
    localStorage.setItem('gcore_games_db', JSON.stringify(games));
  }, [games]);

  // Sync categories to local storage
  useEffect(() => {
    localStorage.setItem('gcore_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gcore_active_session', JSON.stringify(currentUser));
      
      // Also update inside global users list for persistence on logins
      const savedUsers: UserAccount[] = JSON.parse(localStorage.getItem('gcore_users') || '[]');
      const otherUsers = savedUsers.filter(u => u.id !== currentUser.id);
      localStorage.setItem('gcore_users', JSON.stringify([...otherUsers, currentUser]));
    } else {
      localStorage.removeItem('gcore_active_session');
    }
  }, [currentUser]);

  // Handle Authentication flow
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveTab('USERS'); // Go to users list by default upon logging in
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente encerrar sua sessão no sistema?')) {
      setCurrentUser(null);
      setIsMobileMenuOpen(false);
      setIsProfileDropdownOpen(false);
    }
  };

  // Gamers database actions (create/update)
  const handleSaveGamer = (gData: Omit<Gamer, 'id'> & { id?: string }) => {
    // Add category if it doesn't exist
    if (gData.category && !categories.includes(gData.category)) {
      setCategories((prev: string[]) => [...prev, gData.category]);
    }

    if (gData.id) {
      // Editing existing
      setGamers((prev: Gamer[]) => prev.map((item: Gamer) => item.id === gData.id ? (gData as Gamer) : item));
    } else {
      // Creating new
      const newGamer: Gamer = {
        ...gData,
        id: 'g-' + Math.random().toString(36).substring(2, 9)
      };
      setGamers((prev: Gamer[]) => [newGamer, ...prev]);
    }
    setEditingGamer(null);
    setIsGamerModalOpen(false); 
  };

  const handleAddCategory = (categoryName: string) => {
    if (categoryName.trim() && !categories.includes(categoryName.trim())) {
      setCategories((prev: string[]) => [...prev, categoryName.trim()]);
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    const gamersUsingCategory = gamers.filter((g: Gamer) => g.category === categoryName);
    
    if (gamersUsingCategory.length > 0) {
      const confirmed = confirm(
        `Existem ${gamersUsingCategory.length} gamer(s) nessa categoria.\n\nDeseja realmente deletar? Os gamers não serão removidos, apenas ficarão sem categoria.`
      );
      if (!confirmed) return;
    } else {
      if (!confirm(`Deseja realmente deletar a categoria "${categoryName}"?`)) return;
    }

    setCategories((prev: string[]) => prev.filter(cat => cat !== categoryName));
  };

  const handleDeleteGamer = (id: string) => {
    const gamer = gamers.find(g => g.id === id);
    if (!gamer) return;
    if (confirm(`Deseja realmente remover o jogador "${gamer.name}" do sistema?`)) {
      setGamers((prev: Gamer[]) => prev.filter((item: Gamer) => item.id !== id));
    }
  };

  const handleTriggerEditGamer = (g: Gamer) => {
    setEditingGamer(g);
    setIsGamerModalOpen(true);
  };

  // Games database actions
  const handleSaveGame = (gameData: Omit<Game, 'id'>) => {
    const newGame: Game = {
      ...gameData,
      id: 'game-' + Math.random().toString(36).substring(2, 9),
    };
    setGames((prev: Game[]) => [newGame, ...prev]);
    setIsGameModalOpen(false);
  };

  const handleDeleteGame = (id: string) => {
    const game = games.find((g) => g.id === id);
    if (!game) return;
    if (confirm(`Deseja realmente remover "${game.name}" da biblioteca?`)) {
      setGames((prev: Game[]) => prev.filter((g) => g.id !== id));
    }
  };

  // Color mapping logic for customized preference selections
  const userColorPref = currentUser?.preferences?.primaryColor || 'orange';
  
  const getColorsSet = () => {
    switch (userColorPref) {
      case 'purple':
        return {
          primaryText: 'text-[#ddb7ff]',
          primaryBg: 'bg-[#b76dff]',
          borderFocus: 'focus:border-[#b76dff] focus:shadow-[0_4px_20px_rgba(183,109,255,0.15)]',
          glowClass: 'neon-glow-primary-purple',
          accentColorHex: '#ddb7ff'
        };
      case 'cyan':
        return {
          primaryText: 'text-[#4cd7f6]',
          primaryBg: 'bg-[#03b5d3]',
          borderFocus: 'focus:border-[#03b5d3] focus:shadow-[0_4px_20px_rgba(3,181,211,0.15)]',
          glowClass: 'neon-glow-primary-cyan',
          accentColorHex: '#4cd7f6'
        };
      case 'magenta':
        return {
          primaryText: 'text-[#ec4899]',
          primaryBg: 'bg-[#ec4899]',
          borderFocus: 'focus:border-[#ec4899] focus:shadow-[0_4px_20px_rgba(236,72,153,0.15)]',
          glowClass: 'neon-glow-primary-magenta', // CORREÇÃO: Corrigido de cyan para magenta
          accentColorHex: '#ec4899'
        };
      case 'green':
        return {
          primaryText: 'text-[#91db2a]',
          primaryBg: 'bg-[#65a100]',
          borderFocus: 'focus:border-[#65a100] focus:shadow-[0_4px_20px_rgba(101,161,0,0.15)]',
          glowClass: 'neon-glow-primary-green', // CORREÇÃO: Corrigido de cyan para green
          accentColorHex: '#91db2a'
        };
      case 'orange':
      default:
        return {
          primaryText: 'text-[#f97316]',
          primaryBg: 'bg-[#f97316]',
          borderFocus: 'focus:border-[#f97316] focus:shadow-[0_4px_20px_rgba(249,115,22,0.15)]',
          glowClass: 'neon-glow-primary-orange',
          accentColorHex: '#f97316'
        };
    }
  };

  const colorsSet = getColorsSet();
  const bgPatternEnabled = currentUser?.preferences?.bgPattern ?? true;

  // Render Authentication overlay if session does not exist
  if (!currentUser) {
    return (
      <AuthContainer 
        onLoginSuccess={handleLoginSuccess}
        primaryColor={userColorPref}
        colorsSet={colorsSet}
      />
    );
  }

  // Else, render the customized dashboard workspace layout
  return (
    <div className={`h-screen w-full flex bg-[#131313] text-[#e5e2e1] antialiased select-none font-sans overflow-hidden ${bgPatternEnabled ? 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] bg-opacity-25' : ''}`}>
      
      {/* 1. Left Docked Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-[#0e0e0e] border-r border-[#cfc2d6]/10 py-6 px-4 shrink-0 z-20">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-12 px-3">
          <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex items-center justify-center border border-[#cfc2d6]/15 hover:border-orange-500/25 transition-all">
            <Gamepad2 className={colorsSet.primaryText} size={22} />
          </div>
          <div>
            <h1 className="font-display text-lg font-extrabold text-[#f97316] tracking-widest leading-none">
              G-CORE
            </h1>
            <p className="text-[9px] text-[#cfc2d6]/40 font-mono mt-1 font-semibold tracking-wider">COMMAND CENTER</p>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          {/* Dashboard Button */}
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-300 ease-in-out cursor-pointer ${
              activeTab === 'DASHBOARD'
                ? `${colorsSet.primaryText} border-r-2 border-[#f97316] bg-[#f97316]/5`
                : 'text-[#cfc2d6]/60 hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>DASHBOARD</span>
          </button>

          {/* Users Button */}
          <button
            onClick={() => setActiveTab('USERS')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-300 ease-in-out cursor-pointer ${
              activeTab === 'USERS'
                ? `${colorsSet.primaryText} border-r-2 border-[#f97316] bg-[#f97316]/5`
                : 'text-[#cfc2d6]/60 hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            <Users size={18} />
            <span>USUÁRIOS</span>
          </button>

          {/* Games Button — positioned between Usuários and Dashboard */}
          <button
            onClick={() => setActiveTab('GAMES')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-300 ease-in-out cursor-pointer ${
              activeTab === 'GAMES'
                ? `${colorsSet.primaryText} border-r-2 border-[#f97316] bg-[#f97316]/5`
                : 'text-[#cfc2d6]/60 hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            <Trophy size={18} />
            <span>JOGOS</span>
          </button>

          {/* Chatbot Button */}
          <button
            onClick={() => setActiveTab('CHATBOT')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-300 ease-in-out cursor-pointer ${
              activeTab === 'CHATBOT'
                ? `${colorsSet.primaryText} border-r-2 border-[#f97316] bg-[#f97316]/5`
                : 'text-[#cfc2d6]/60 hover:bg-[#201f1f] hover:text-[#e5e2e1]'
            }`}
          >
            <MessageSquare size={18} />
            <span>CHATBOT</span>
          </button>
        </nav>

        {/* Support & Logout footer navigation */}
        <div className="border-t border-[#cfc2d6]/10 pt-5 flex flex-col gap-1">
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#cfc2d6]/60 hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-all font-mono text-xs font-bold text-left cursor-pointer"
          >
            <Tag size={18} />
            <span>CATEGORIAS</span>
          </button>
          <button
            onClick={() => alert('Suporte G-CORE:\nCentral de atendimento temporariamente offline. Em breve disponível!')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#cfc2d6]/60 hover:bg-[#201f1f] hover:text-[#e5e2e1] transition-all font-mono text-xs font-bold text-left cursor-pointer"
          >
            <HelpCircle size={18} />
            <span>SUPORTE</span>
          </button>
        </div>
      </aside>

      {/* 2. Main content container block */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#131313]/90 relative h-screen overflow-hidden">
        
        {/* Sticky Header */}
        <header className="w-full h-16 shrink-0 flex items-center justify-between px-6 bg-[#1a1a1a]/40 border-b border-[#cfc2d6]/10 backdrop-blur-md z-30">
          
          {/* Brand header on mobile views */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-[#cfc2d6]/80 hover:text-[#e5e2e1] p-1 rounded hover:bg-white/5 active:scale-95 transition-all"
            >
              <Menu size={20} />
            </button>
            <span className="md:hidden font-display text-base font-extrabold text-[#f97316] tracking-widest uppercase">
              G-CORE
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto relative">
            
            <p className="hidden sm:block text-xs font-mono text-[#cfc2d6]/50">
              Operador: <span className="text-[#e5e2e1] font-bold">{currentUser.name}</span>
            </p>

            {/* Profile trigger avatar */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`h-9 w-9 rounded-full bg-[#201f1f] border-2 overflow-hidden cursor-pointer transition-all ${
                  isProfileDropdownOpen ? 'border-[#f97316] scale-105 shadow-md' : 'border-[#cfc2d6]/20 hover:border-[#f97316]'
                }`}
              >
                <img 
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </button>

              {/* Profile Context Dropdown */}
              {isProfileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-[#1A1A1A] border border-[#cfc2d6]/20 rounded-lg shadow-2xl z-50 overflow-hidden font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 bg-[#201f1f]/60 border-b border-[#cfc2d6]/10">
                      <p className="text-[10px] text-[#cfc2d6]/40 uppercase tracking-wider font-bold">OPERADOR LOGADO</p>
                      <p className="text-[#e5e2e1] font-bold truncate mt-0.5">{currentUser.name}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setAccountModalTab('ACCOUNT');
                        setIsAccountModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#201f1f] text-[#cfc2d6] hover:text-[#e5e2e1] flex items-center gap-2.5 transition-colors"
                    >
                      <Users size={14} className={colorsSet.primaryText} />
                      <span>EDITAR MINHA CONTA</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setAccountModalTab('PREFS');
                        setIsAccountModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#201f1f] text-[#cfc2d6] hover:text-[#e5e2e1] flex items-center gap-2.5 transition-colors border-t border-[#cfc2d6]/5"
                    >
                      <Sliders size={14} className={colorsSet.primaryText} />
                      <span>PREFERÊNCIAS</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2.5 transition-colors border-t border-[#cfc2d6]/10"
                    >
                      <LogOut size={14} />
                      <span>SAIR</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Scrollable Container Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          
          <div className="max-w-6xl mx-auto w-full relative z-10">
            {activeTab === 'USERS' && (
              <UsersView
                gamers={gamers}
                categories={categories}
                onAddGamerClick={() => {
                  setEditingGamer(null);
                  setIsGamerModalOpen(true);
                }}
                onEditGamerClick={handleTriggerEditGamer}
                onDeleteGamerClick={handleDeleteGamer}
                colorsSet={colorsSet}
              />
            )}
            {activeTab === 'GAMES' && (
              <GamesView
                games={games}
                onAddGameClick={() => setIsGameModalOpen(true)}
                onDeleteGameClick={handleDeleteGame}
                colorsSet={colorsSet}
              />
            )}
            {activeTab === 'DASHBOARD' && (
              <DashboardView 
                gamers={gamers}
                categories={categories}
                colorsSet={colorsSet}
              />
            )}
            {activeTab === 'CHATBOT' && (
              <ChatbotView 
                colorsSet={colorsSet}
              />
            )}
          </div>

        </div>

      </main>

      {/* 3. Mobile Navigation SideDrawer menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          {/* Sidebar Drawer Panel */}
          <div className="relative w-64 bg-[#0e0e0e] h-full p-6 flex flex-col justify-between border-r border-[#cfc2d6]/10 z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer header brand */}
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-lg font-extrabold text-[#f97316] tracking-widest uppercase">
                  G-CORE
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#cfc2d6]/60 p-1 rounded-full hover:bg-white/5 active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setActiveTab('DASHBOARD');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                    activeTab === 'DASHBOARD'
                      ? `${colorsSet.primaryText} bg-[#f97316]/5`
                      : 'text-[#cfc2d6]/60 hover:bg-[#201f1f]'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span>DASHBOARD</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('USERS');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                    activeTab === 'USERS'
                      ? `${colorsSet.primaryText} bg-[#f97316]/5`
                      : 'text-[#cfc2d6]/60 hover:bg-[#201f1f]'
                  }`}
                >
                  <Users size={16} />
                  <span>USUÁRIOS</span>
                </button>

                {/* Games mobile nav item */}
                <button
                  onClick={() => {
                    setActiveTab('GAMES');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                    activeTab === 'GAMES'
                      ? `${colorsSet.primaryText} bg-[#f97316]/5`
                      : 'text-[#cfc2d6]/60 hover:bg-[#201f1f]'
                  }`}
                >
                  <Trophy size={16} />
                  <span>JOGOS</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('CHATBOT');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                    activeTab === 'CHATBOT'
                      ? `${colorsSet.primaryText} bg-[#f97316]/5`
                      : 'text-[#cfc2d6]/60 hover:bg-[#201f1f]'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>CHATBOT</span>
                </button>
              </nav>
            </div>

            {/* Logout drawer */}
            <div className="flex flex-col gap-1 border-t border-[#cfc2d6]/10 pt-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  alert('Suporte G-CORE:\nCentral de atendimento temporariamente offline. Em breve disponível!');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[#cfc2d6]/60 hover:bg-[#201f1f] text-xs font-mono font-semibold text-left cursor-pointer"
              >
                <HelpCircle size={16} />
                <span>SUPORTE</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 text-xs font-mono font-semibold text-left cursor-pointer"
              >
                <LogOut size={16} />
                <span>SAIR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modals Overlay Mount points */}

      {/* Add Game Modal overlay */}
      <GameModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        onSave={handleSaveGame}
        colorsSet={colorsSet}
      />
      
      {/* Add/Edit Gamer Modal overlay */}
      <GamerModal
        isOpen={isGamerModalOpen}
        onClose={() => {
          setIsGamerModalOpen(false);
          setEditingGamer(null);
        }}
        onSave={handleSaveGamer}
        onAddCategory={handleAddCategory}
        editingGamer={editingGamer}
        categories={categories}
        colorsSet={colorsSet}
      />

      {/* Edit Profiling Account Modal overlay */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
        initialTab={accountModalTab}
      />

      {/* Manage Categories Modal overlay */}
      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        gamers={gamers}
        onDeleteCategory={handleDeleteCategory}
        onAddCategory={handleAddCategory}
        colorsSet={colorsSet}
      />

    </div>
  );
}