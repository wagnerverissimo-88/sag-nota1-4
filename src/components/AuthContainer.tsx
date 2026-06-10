import React, { useState } from 'react';
import { Mail, Key, Eye, EyeOff, User, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';
import { AuthMode, UserAccount } from '../types';

interface AuthContainerProps {
  onLoginSuccess: (user: UserAccount) => void;
  primaryColor?: string;
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
    accentColorHex: string;
  };
}

export default function AuthContainer({
  onLoginSuccess,
  primaryColor,
  colorsSet,
}: AuthContainerProps) {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  // Login values
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register values
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Forgot Password values
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSentMessage, setForgotSentMessage] = useState('');

  // General controls
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Login Action
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Por favor, informe seu e-mail e senha.');
      return;
    }

    // Retrieve database from localStorage
    const savedUsers: UserAccount[] = JSON.parse(localStorage.getItem('gcore_users') || '[]');
    
    // Check if user exists
    let matchedUser = savedUsers.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase()
    );

    // If matches default credential simulation
    if (!matchedUser && loginEmail.toLowerCase() === 'gestor@elite.com') {
      matchedUser = {
        id: 'default_gestor_id',
        name: 'Gestor Elite',
        email: 'gestor@elite.com',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWl2zRe54s9XwnhMLd7qp1fCIqwfr9L6nrCGOM29L_aiXw-Joh4kDvdWBMYyU75oI-YcYIvjN3ewOrKNd_7id4tybA4nbdAf7gQDkZeGqVjw73W1sPCU9RIIImUKt_n18cvu_cErMe20LcN4J7ucFBQtisve6TcUsuejiMouXPAqp38XWLfo9cp3XUCHHPB9XSl_CcQeWSceXCrcYhYf0rldCSSYZHJuC6GsCKpv_fzJ_4474VkUUG2jmHDv3Wugx3i0NccHmOlC0',
        preferences: {
          primaryColor: 'orange',
          bgPattern: true,
          avatarSelection: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWl2zRe54s9XwnhMLd7qp1fCIqwfr9L6nrCGOM29L_aiXw-Joh4kDvdWBMYyU75oI-YcYIvjN3ewOrKNd_7id4tybA4nbdAf7gQDkZeGqVjw73W1sPCU9RIIImUKt_n18cvu_cErMe20LcN4J7ucFBQtisve6TcUsuejiMouXPAqp38XWLfo9cp3XUCHHPB9XSl_CcQeWSceXCrcYhYf0rldCSSYZHJuC6GsCKpv_fzJ_4474VkUUG2jmHDv3Wugx3i0NccHmOlC0'
        }
      };
      
      // Save it temporarily for consistency
      const updatedList = [...savedUsers, matchedUser];
      localStorage.setItem('gcore_users', JSON.stringify(updatedList));
    }

    if (matchedUser) {
      if (loginPassword.length < 4) {
        setErrorMsg('A senha deve conter no mínimo 4 caracteres.');
        return;
      }
      // Verifica se a senha inserida coincide com a cadastrada
      if (matchedUser.password && matchedUser.password !== loginPassword) {
        setErrorMsg('Senha incorreta. Verifique suas credenciais.');
        return;
      }
      onLoginSuccess(matchedUser);
    } else {
      setErrorMsg('Usuário não encontrado. Crie uma conta usando o link abaixo!');
    }
  };

  // Handle Registration Action
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!registerName.trim()) {
      setErrorMsg('Nome é obrigatório.');
      return;
    }
    if (!registerEmail.trim()) {
      setErrorMsg('E-mail é obrigatório.');
      return;
    }
    if (!registerPassword) {
      setErrorMsg('Informe uma senha válida.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setErrorMsg('A confirmação de senha não coincide.');
      return;
    }

    // Save user in Local database
    const savedUsers: UserAccount[] = JSON.parse(localStorage.getItem('gcore_users') || '[]');
    
    // Check duplication
    const duplicate = savedUsers.some(u => u.email.toLowerCase() === registerEmail.toLowerCase());
    if (duplicate || registerEmail.toLowerCase() === 'gestor@elite.com') {
      setErrorMsg('Este endereço de e-mail já está em uso.');
      return;
    }

    const newUser: UserAccount = {
      id: Math.random().toString(36).substring(2, 9),
      name: registerName,
      email: registerEmail.toLowerCase(),
      password: registerPassword, // Mock safety
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      preferences: {
        primaryColor: 'purple',
        bgPattern: true,
        avatarSelection: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      }
    };

    const updatedUsers = [...savedUsers, newUser];
    localStorage.setItem('gcore_users', JSON.stringify(updatedUsers));
    
    // Auto-login to simplify
    onLoginSuccess(newUser);
  };

  // Handle Forgot Password simulation click
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg('Por favor, informe seu e-mail.');
      return;
    }

    setForgotSentMessage(`Sucesso! Um link de redefinição de senha foi gerado e enviado para "${forgotEmail}". Verifique sua caixa de entrada.`);
    setForgotEmail('');
    setErrorMsg('');
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#131313] text-[#e5e2e1] font-sans">
      
      {/* LEFT SIDE: Cinematic workstation preview graphic (hidden on mobile) */}
      <section className="hidden lg:flex w-1/2 relative bg-[#0e0e0e] overflow-hidden">
        {/* Ambient Station background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-linear hover:scale-105" 
          style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCBqKpulI0unOXPMtR-mMB0__Tsu8udWn0WPm7ktBIsZzEPTslS0UEitzn6xGVwUrsZHvPXKZkhGl5DsCv00uzAWxG1oBIOlCoSSTMj3OeNQIW-JIS5vYR7kQymbRhc3y4M3XJw7YKNjjwh-eEyMEq0Tiw2H_P2z0j3ZkAsM1mR9FKL0Ev-oZiZTr-kM2UIhw_AKyLXBLWDB24gWGI-oFI1WoJl5GkLzGNOtI8ZepVWVVHMljOa0OYOLmSvp2_BtgH5iaGazfDLov8")` }}
        />
        {/* Soft background shader logic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#131313]/50 to-[#131313] z-10 backdrop-blur-[1px]" />
        
        {/* Branding text over art context */}
        <div className="absolute bottom-16 left-12 right-12 z-20">
          <h2 className="font-display text-4xl font-extrabold text-[#e5e2e1] mb-2 tracking-tight drop-shadow-md">
            G-CORE
          </h2>
          <p className="text-body-sm text-[#cfc2d6]/70 leading-relaxed max-w-md">
            Experimente o site para gerenciar gamers! Ainda em fase de desenvolvimento.
          </p>
        </div>
      </section>

      {/* RIGHT SIDE: Interactive forms section */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10 overflow-y-auto">
        {/* Minimal grid background simulation */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#cfc2d6 1px, transparent 1px), linear-gradient(90deg, #cfc2d6 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Backdrop radial glowing accent */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full opacity-[0.03] blur-3xl pointer-events-none" style={{ backgroundColor: colorsSet.accentColorHex }} />

        <div className="w-full max-w-[420px] flex flex-col gap-8 relative z-20">
          
          {/* Logo element shown on mobile layout too */}
          <div className="text-left font-display">
            <h1 className="text-3xl font-extrabold tracking-wider text-[#e5e2e1] uppercase flex items-center gap-2">
              <span className={colorsSet.primaryText}>G-CORE</span>
            </h1>
            <p className="text-xs text-[#cfc2d6]/40 font-mono mt-1 uppercase tracking-widest">GERENCIAMENTO DE GAMERS</p>
          </div>

          {/* Feedback error popup */}
          {errorMsg && (
            <div className="bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r text-red-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* MODE: LOGIN VIEW */}
          {mode === 'LOGIN' && (
            <div className="flex flex-col gap-6 font-sans">
              <div>
                <h2 className="text-xl font-bold text-[#e5e2e1] font-display">Login</h2>
                <p className="text-xs text-[#cfc2d6]/50 mt-1">Conecte sua conta.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                {/* Email field */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest group-focus-within:text-[#f97316] transition-colors">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="gestor@elite.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3.5 pl-10 focus:outline-none focus:bg-[#201f1f] text-sm rounded ${colorsSet.borderFocus} transition-all duration-300`}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1.5 group">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <label className="font-medium text-[#cfc2d6]/60 uppercase tracking-widest group-focus-within:text-[#f97316] transition-colors">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('FORGOT_PASSWORD'); setErrorMsg(''); }}
                      className="text-[#4cd7f6] hover:underline hover:text-cyan-400 transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3.5 pl-10 focus:outline-none focus:bg-[#201f1f] text-sm rounded ${colorsSet.borderFocus} transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40 hover:text-[#e5e2e1] transition-all"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`mt-3 w-full text-[#131313] font-mono text-xs py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
                >
                  <span>Iniciar Sessão</span>
                  <ArrowRight size={14} className="animate-pulse" />
                </button>
              </form>

              {/* Box Footer redirect to Registration */}
              <div className="mt-4 p-5 bg-[#201f1f]/30 border border-[#cfc2d6]/10 rounded-lg text-center backdrop-blur-sm animate-in fade-in duration-300">
                <p className="text-xs text-[#cfc2d6]/60">Não possui uma conta?</p>
                <button
                  onClick={() => { setMode('REGISTER'); setErrorMsg(''); }}
                  className={`${colorsSet.primaryText} hover:brightness-125 font-mono text-xs uppercase tracking-wider font-bold mt-2 hover:underline transition-all cursor-pointer`}
                >
                  FAZER CADASTRO →
                </button>
              </div>
            </div>
          )}

          {/* MODE: REGISTER VIEW */}
          {mode === 'REGISTER' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-[#e5e2e1] font-display">Cadastre-se</h2>
                <p className="text-xs text-[#cfc2d6]/50 mt-1">Crie sua conta para utilizar o site.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                {/* Nome Completo */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest transition-colors">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="Seu nome de registro"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3.5 pl-10 focus:outline-none focus:bg-[#201f1f] text-sm rounded ${colorsSet.borderFocus} transition-all duration-300`}
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest transition-colors">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3.5 pl-10 focus:outline-none focus:bg-[#201f1f] text-sm rounded ${colorsSet.borderFocus} transition-all duration-300`}
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest transition-colors">
                    Senha
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3.5 pl-10 focus:outline-none focus:bg-[#201f1f] text-sm rounded ${colorsSet.borderFocus} transition-all duration-300`}
                    />
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="flex flex-col gap-1.5 group">
                  <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest transition-colors">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3.5 pl-10 focus:outline-none focus:bg-[#201f1f] text-sm rounded ${colorsSet.borderFocus} transition-all duration-300`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`mt-3 w-full text-[#131313] font-mono text-xs py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
                >
                  <span>Criar Conta</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              {/* Redirect to Login */}
              <div className="text-center pt-3 border-t border-[#cfc2d6]/10">
                <span className="text-xs text-[#cfc2d6]/60">Já possui uma conta?</span>
                <button
                  onClick={() => { setMode('LOGIN'); setErrorMsg(''); }}
                  className={`${colorsSet.primaryText} hover:brightness-125 hover:underline font-mono text-xs font-bold uppercase tracking-wider ml-2 cursor-pointer`}
                >
                  Faça Login
                </button>
              </div>
            </div>
          )}

          {/* MODE: FORGOT PASSWORD VIEW */}
          {mode === 'FORGOT_PASSWORD' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-[#e5e2e1] font-display">Redefinir Senha</h2>
                <p className="text-xs text-[#cfc2d6]/50 mt-1">Informe seu e-mail cadastrado para mandarmos um link.</p>
              </div>

              {forgotSentMessage ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-lg flex flex-col gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-[#91db2a] font-mono text-xs font-bold">
                    <ShieldCheck size={18} />
                    <span>LINK DE REDEFINIÇÃO DE SENHA GERADO</span>
                  </div>
                  <p className="text-xs text-[#cfc2d6]/80 leading-relaxed font-mono">
                    {forgotSentMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setMode('LOGIN'); setForgotSentMessage(''); }}
                    className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-[#4cd7f6] hover:brightness-110 self-start"
                  >
                    ← VOLTAR AO LOGIN
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 group">
                    <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest transition-colors">
                      E-mail Cadastro
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40" size={16} />
                      <input
                        type="email"
                        required
                        placeholder="gestor@elite.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b-2 border-[#cfc2d6]/10 px-3.5 py-3.5 pl-10 focus:outline-none focus:bg-[#201f1f] text-sm rounded ${colorsSet.borderFocus} transition-all duration-300`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`mt-2 w-full text-[#131313] font-mono text-xs py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 duration-200 cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
                  >
                    <span>RECUPERAR MINHA SENHA</span>
                  </button>

                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => { setMode('LOGIN'); setErrorMsg(''); }}
                      className="text-xs font-mono text-[#cfc2d6]/60 hover:text-[#e5e2e1] font-bold"
                    >
                      ← CANCELAR E VOLTAR
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
