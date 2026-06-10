import React from 'react';
import { Users, Clock } from 'lucide-react';
import { Gamer, GameCategory } from '../types';

interface DashboardViewProps {
  gamers: Gamer[];
  categories: string[];
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
    accentColorHex: string;
  };
}

export default function DashboardView({ gamers, categories, colorsSet }: DashboardViewProps) {
  // 1. Total Registered Users
  const totalUsers = gamers.length;

  // 2. Daily Free Time Average calculation
  const totalFreeTime = gamers.reduce((acc, curr) => acc + curr.dailyFreeTime, 0);
  const avgFreeTime = totalUsers > 0 ? (totalFreeTime / totalUsers).toFixed(1) : '0.0';

  // 3. Calculate distributions by category
  const categoryCounts: Record<string, number> = {};
  
  categories.forEach(cat => {
    categoryCounts[cat] = 0;
  });

  gamers.forEach(g => {
    if (categoryCounts[g.category] !== undefined) {
      categoryCounts[g.category]++;
    } else {
      categoryCounts[g.category] = 1;
    }
  });

  // Convert to percentages
  const categoryPercentages = categories.map(cat => {
    const count = categoryCounts[cat] || 0;
    const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
    return { category: cat, percentage, count };
  }).filter(item => item.count > 0).sort((a, b) => b.percentage - a.percentage); // Sort descending

  // 5. Calculate Age Distributions: <18, 18-24, 25-34, 35+
  let ageUnder18 = 0;
  let age18to24 = 0;
  let age25to34 = 0;
  let age35Plus = 0;

  gamers.forEach(g => {
    if (g.age < 18) ageUnder18++;
    else if (g.age <= 24) age18to24++;
    else if (g.age <= 34) age25to34++;
    else age35Plus++;
  });

  const ageData = [
    { label: '<18', count: ageUnder18, percentage: totalUsers > 0 ? Math.round((ageUnder18 / totalUsers) * 100) : 0 },
    { label: '18-24', count: age18to24, percentage: totalUsers > 0 ? Math.round((age18to24 / totalUsers) * 100) : 0 },
    { label: '25-34', count: age25to34, percentage: totalUsers > 0 ? Math.round((age25to34 / totalUsers) * 100) : 0 },
    { label: '35+', count: age35Plus, percentage: totalUsers > 0 ? Math.round((age35Plus / totalUsers) * 100) : 0 },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 md:gap-8">
      {/* Visual background ambient details */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full opacity-[0.03] blur-3xl pointer-events-none" style={{ backgroundColor: colorsSet.accentColorHex }} />

      {/* Title & Headline */}
      <div className="border-b border-[#cfc2d6]/10 pb-5">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#e5e2e1] tracking-tight mb-2">
          Dashboard de Gamers
        </h2>
        <p className="text-body-sm text-[#cfc2d6]/60 leading-relaxed max-w-2xl">
          Análise quantitativa em tempo real da base de jogadores e usuários registrados no G-CORE.
        </p>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KPI 1: Registros */}
        <div className="relative bg-[#201f1f]/35 backdrop-blur-md border border-[#cfc2d6]/15 hover:border-[#cfc2d6]/30 rounded-xl p-5 md:p-6 flex flex-col justify-between h-36 transition-all duration-300 shadow-xl group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-white/[0.01] pointer-events-none group-hover:bg-white/[0.02] transition-all" />
          <div className="flex justify-between items-center text-[#cfc2d6]/60 text-xs">
            <span className="font-mono uppercase tracking-widest font-semibold">TOTAL REGISTRADOS</span>
            <span className={`p-1 rounded bg-[#2a2a2a] ${colorsSet.primaryText}`}>
              <Users size={16} />
            </span>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-[#e5e2e1] tracking-tight">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-[10px] text-[#cfc2d6]/40 font-mono mt-1">Jogadores Ativos na Base</p>
          </div>
        </div>

        {/* KPI 2: Tempo de Jogo Médio */}
        <div className="relative bg-[#201f1f]/35 backdrop-blur-md border border-[#cfc2d6]/15 hover:border-[#cfc2d6]/30 rounded-xl p-5 md:p-6 flex flex-col justify-between h-36 transition-all duration-300 shadow-xl group">
          <div className="flex justify-between items-center text-[#cfc2d6]/60 text-xs">
            <span className="font-mono uppercase tracking-widest font-semibold font-semibold">MÉDIA DE TEMPO LIVRE</span>
            <span className="p-1 rounded bg-[#2a2a2a] text-[#ffd333]">
              <Clock size={16} />
            </span>
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-[#e5e2e1] tracking-tight">
              {avgFreeTime} <span className="text-sm font-mono text-[#cfc2d6]/50">horas/dia</span>
            </div>
            <p className="text-[10px] text-[#cfc2d6]/40 font-mono mt-1">Disponibilidade dos jogadores declarada</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribution by Category Card */}
        <div className="bg-[#201f1f]/35 backdrop-blur-md border border-[#cfc2d6]/15 rounded-xl p-6 shadow-xl flex flex-col min-h-[340px]">
          <h3 className="font-display text-base font-bold text-[#e5e2e1] mb-5 flex items-center justify-between">
            <span>Distribuição por Categoria de Jogo</span>
            <span className="text-[11px] font-mono text-[#cfc2d6]/40 uppercase font-medium">Categorias Ativas</span>
          </h3>
          
          {totalUsers === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#cfc2d6]/10 rounded-lg">
              <span className="text-3xl mb-2">📊</span>
              <p className="text-xs text-[#cfc2d6]/50">Cadastre jogadores para visualizar a distribuição de categorias.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 justify-center">
              {categoryPercentages.map(({ category, percentage, count }) => (
                <div key={category}>
                  <div className="flex justify-between text-xs font-mono text-[#cfc2d6]/80 mb-1.5 font-medium">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(category) }} />
                      {category} <span className="opacity-40 text-[10px] font-normal">({count} gamer{count !== 1 ? 's' : ''})</span>
                    </span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] h-2.5 rounded-full overflow-hidden border border-[#cfc2d6]/5">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(category)
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Age Range Distribution Card */}
        <div className="bg-[#201f1f]/35 backdrop-blur-md border border-[#cfc2d6]/15 rounded-xl p-6 shadow-xl flex flex-col min-h-[340px]">
          <h3 className="font-display text-base font-bold text-[#e5e2e1] mb-5 flex items-center justify-between">
            <span>Distribuição por Faixa Etária</span>
            <span className="text-[11px] font-mono text-[#cfc2d6]/40 uppercase font-medium">Análise de Idade</span>
          </h3>

          {totalUsers === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#cfc2d6]/10 rounded-lg">
              <span className="text-3xl mb-2">⏳</span>
              <p className="text-xs text-[#cfc2d6]/50">Cadastre jogadores para visualizar as faixas etárias.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-end">
              {/* Columns container */}
              <div className="flex items-end gap-3 h-48 px-2">
                {ageData.map((data, idx) => {
                  // Determine height ratio
                  const colHeight = totalUsers > 0 ? Math.max(8, data.percentage) : 10;
                  const isActive = data.percentage === Math.max(...ageData.map(d => d.percentage));

                  return (
                    <div key={data.label} className="flex flex-col items-center flex-1 gap-2.5 group">
                      {/* Percent badge on hover/always */}
                      <span className="font-mono text-[11px] text-[#cfc2d6]/80 font-medium transition-opacity duration-300">
                        {data.percentage}%
                      </span>
                      
                      {/* Pillar background */}
                      <div className="w-full bg-[#1c1b1b] border border-[#cfc2d6]/10 rounded-t-lg hover:border-[#cfc2d6]/30 overflow-hidden relative flex items-end h-36 transition-all duration-300">
                        {/* Dynamic percentage pillar filling */}
                        <div 
                          className="w-full rounded-t-md transition-all duration-700 ease-out relative"
                          style={{ 
                            height: `${colHeight}%`,
                            background: isActive 
                              ? `linear-gradient(to top, rgba(249, 115, 22, 0.2), ${colorsSet.accentColorHex})`
                              : 'linear-gradient(to top, rgba(76, 215, 246, 0.1), rgba(76, 215, 246, 0.6))',
                            boxShadow: isActive ? `0 0 15px ${colorsSet.accentColorHex}40` : 'none'
                          }}
                        />
                      </div>
                      
                      {/* X-axis Label */}
                      <span className={`font-mono text-xs ${isActive ? colorsSet.primaryText + ' font-bold' : 'text-[#cfc2d6]/60'}`}>
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#cfc2d6]/40 font-mono text-center mt-4">
                *Adolescentes, jovens adultos e veteranos.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Suggested Quick tips / Recommendation engine card */}
      <div className="bg-[#2a2a2a]/40 border border-[#cfc2d6]/10 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">✨</span>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#e5e2e1] font-semibold">Painel Informativo</h4>
            <p className="text-xs text-[#cfc2d6]/60 mt-0.5">
              Crie logins adicionais para simular novas sessões, ou altere as cores temáticas do G-CORE no menu de perfil!
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-[#cfc2d6]/50 bg-[#141414] px-3 py-1.5 rounded border border-[#cfc2d6]/10">
          UTC: 2026-05-26
        </div>
      </div>
    </div>
  );
}

// Category helper color picker (dynamic based on hash)
function getCategoryColor(category: string): string {
  // Generate a hash from category name
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const colors = [
    '#f97316', // orange
    '#4cd7f6', // cyan
    '#91db2a', // green
    '#a855f7', // purple
    '#ec4899', // pink
    '#eab308', // yellow
    '#3b82f6', // blue
    '#06b6d4', // cyan-dark
    '#10b981', // emerald
    '#f43f5e', // rose
  ];
  
  return colors[Math.abs(hash) % colors.length];
}
