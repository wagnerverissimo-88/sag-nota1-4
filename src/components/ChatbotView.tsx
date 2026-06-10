import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, MessageSquare, Key, Eye, EyeOff, Send, Trash2, Clock, 
  ArrowLeft, AlertCircle, Sparkles, CheckCircle, Gamepad2, Settings, X, Cpu, Info 
} from 'lucide-react';
import { ChatDoubt, ChatMessage } from '../types';

interface ChatbotViewProps {
  colorsSet: {
    primaryText: string;
    primaryBg: string;
    borderFocus: string;
    glowClass: string;
    accentColorHex: string;
  };
}

export default function ChatbotView({ colorsSet }: ChatbotViewProps) {
  // 1. Core States
  const [doubts, setDoubts] = useState<ChatDoubt[]>(() => {
    const saved = localStorage.getItem('gcore_chatbot_doubts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeDoubtId, setActiveDoubtId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  
  // 2. Chatbot Modes
  const [chatbotMode, setChatbotMode] = useState<'offline' | 'gemini' | 'groq' | 'puter'>(() => {
    const saved = localStorage.getItem('gcore_chatbot_mode');
    return (saved as any) || 'groq';
  });

  const [puterModel, setPuterModel] = useState<string>(() => {
    return localStorage.getItem('gcore_puter_model') || 'gpt-4o-mini';
  });

  const [puterModelsList, setPuterModelsList] = useState<string[]>([
    'gpt-4o-mini',
    'claude-3-5-sonnet',
    'meta-llama-3-8b-instruct',
    'gemini-1.5-flash',
    'deepseek-chat'
  ]);
  
  // 3. Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Geral');
  const [newDescription, setNewDescription] = useState('');
  
  // 4. Chat Active States
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 5. Puter.js load status
  const [isPuterLoaded, setIsPuterLoaded] = useState(false);
  
  // 6. Gemini API Key Management
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gcore_gemini_api_key') || '';
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeySaved, setIsApiKeySaved] = useState(!!localStorage.getItem('gcore_gemini_api_key'));

  // 7. Groq API Key Management (free tier — https://console.groq.com)
  const [groqApiKey, setGroqApiKey] = useState(() => {
    return localStorage.getItem('gcore_groq_api_key') || '';
  });
  const [showGroqApiKey, setShowGroqApiKey] = useState(false);
  const [isGroqApiKeySaved, setIsGroqApiKeySaved] = useState(!!localStorage.getItem('gcore_groq_api_key'));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync doubts with localStorage
  useEffect(() => {
    localStorage.setItem('gcore_chatbot_doubts', JSON.stringify(doubts));
  }, [doubts]);

  // Sync chatbot settings to localStorage
  useEffect(() => {
    localStorage.setItem('gcore_chatbot_mode', chatbotMode);
  }, [chatbotMode]);

  useEffect(() => {
    localStorage.setItem('gcore_puter_model', puterModel);
  }, [puterModel]);

  // Dynamically load Puter.js script and then fetch model list
  useEffect(() => {
    const loadPuterAndModels = () => {
      // If already loaded in window, just update state
      if ((window as any).puter?.ai) {
        setIsPuterLoaded(true);
        fetchPuterModels((window as any).puter);
        return;
      }

      // Check if script tag already exists to avoid duplicates
      if (document.getElementById('puter-js-sdk')) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'puter-js-sdk';
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        console.log('[G-CORE] Puter.js carregado com sucesso.');
        setIsPuterLoaded(true);
        fetchPuterModels((window as any).puter);
      };
      script.onerror = () => {
        console.warn('[G-CORE] Falha ao carregar Puter.js.');
        setIsPuterLoaded(false);
      };
      document.head.appendChild(script);
    };

    const fetchPuterModels = async (puterObj: any) => {
      if (!puterObj?.ai) return;
      try {
        const list = await puterObj.ai.listModels();
        if (list && list.length > 0) {
          const filtered = list
            .filter((m: any) => {
              const name = (m.name || '').toLowerCase();
              return name.includes('gpt') ||
                     name.includes('claude') ||
                     name.includes('llama') ||
                     name.includes('gemini') ||
                     name.includes('deepseek') ||
                     name.includes('mixtral');
            })
            .map((m: any) => m.name);

          if (filtered.length > 0) {
            const uniqueList = Array.from(new Set(filtered)) as string[];
            setPuterModelsList(uniqueList);
            if (!uniqueList.includes(puterModel)) {
              setPuterModel(uniqueList[0]);
            }
          }
        }
      } catch (err) {
        console.warn('[G-CORE] Não foi possível listar modelos do Puter:', err);
      }
    };

    loadPuterAndModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [doubts, activeDoubtId, isTyping]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('gcore_gemini_api_key', apiKey.trim());
      setIsApiKeySaved(true);
      setShowApiSettings(false);
    } else {
      localStorage.removeItem('gcore_gemini_api_key');
      setIsApiKeySaved(false);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gcore_gemini_api_key');
    setApiKey('');
    setIsApiKeySaved(false);
  };

  const handleSaveGroqKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (groqApiKey.trim()) {
      localStorage.setItem('gcore_groq_api_key', groqApiKey.trim());
      setIsGroqApiKeySaved(true);
      setShowApiSettings(false);
    } else {
      localStorage.removeItem('gcore_groq_api_key');
      setIsGroqApiKeySaved(false);
    }
  };

  const handleClearGroqKey = () => {
    localStorage.removeItem('gcore_groq_api_key');
    setGroqApiKey('');
    setIsGroqApiKeySaved(false);
  };

  // Predefined Categories
  const categoriesList = [
    'Geral',
    'RPG / MMORPG',
    'Ação / Aventura',
    'Tiro (FPS / TPS)',
    'Esportes / Corrida',
    'Estratégia / RTS',
    'Hardware / Otimização'
  ];

  // Helper to format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Off-line local gaming expert simulator
  const generateOfflineResponse = (title: string, description: string, category: string): string => {
    const fullText = (title + ' ' + description).toLowerCase();
    
    // Check RPG/Souls/Elden Ring keywords
    if (fullText.includes('elden') || fullText.includes('ring') || fullText.includes('souls') || 
        fullText.includes('malenia') || fullText.includes('boss') || fullText.includes('sekiro') || 
        fullText.includes('bloodborne') || fullText.includes('rpg') || fullText.includes('build')) {
      
      const responses = [
        "Elden Ring / RPGs de ação exigem paciência e estratégia! ⚔️\n\n**Dicas Gerais:**\n1. **Estude os Padrões:** Não ataque gananciosamente. Espere o fim do combo do chefe para encaixar 1 ou 2 golpes.\n2. **Equipamento:** Garanta que seu peso de equipamento esteja como 'Médio' (abaixo de 70% da capacidade total) para que sua esquiva (dodge roll) tenha os frames de invencibilidade corretos.\n3. **Melhorias:** Invista runas em Vitalidade (Vigor) no início. Ter mais vida é mais importante do que ter mais dano bruto na fase inicial do jogo.",
        "Se o problema for a temida Malenia ou um boss ultra difícil:\n- Use builds focadas em **Sangramento (Bleed)** ou **Gelo (Frostbite)**, que tiram porcentagem da barra de vida do chefe.\n- A cinza de invocação *Lágrima Imitadora (Mimic Tear)* atualizada para +10 divide o foco do boss e facilita muito.\n- Para desviar do golpe da Malenia (*Waterfowl Dance*), corra para trás nos dois primeiros giros e esquive em direção a ela no terceiro!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Check Shooter/FPS keywords
    if (fullText.includes('fps') || fullText.includes('cs') || fullText.includes('counter') || 
        fullText.includes('valorant') || fullText.includes('mira') || fullText.includes('recoil') || 
        fullText.includes('cod') || fullText.includes('warzone') || fullText.includes('sensibilidade')) {
      
      return "Para mandar bem nos shooters (FPS/TPS), a consistência mecânica é fundamental! 🎯\n\n**Pontos Chave:**\n1. **Posicionamento de Mira (Crosshair Placement):** Mantenha sua mira SEMPRE na altura da cabeça dos inimigos, antecipando onde eles vão aparecer. Evite mirar no chão!\n2. **Sensibilidade do Mouse:** Menos é mais. A maioria dos pro-players usa DPIs baixos (400 a 800) com sensibilidade in-game baixa para garantir precisão nas micro-correções.\n3. **Treino Diário:** Use ferramentas como Aimlab ou Kovaak por 10 a 15 minutos antes de começar suas partidas competitivas. O aquecimento muscular faz milagres.";
    }

    // Check Sports/Racing keywords
    if (fullText.includes('fifa') || fullText.includes('fc') || fullText.includes('futebol') || 
        fullText.includes('pes') || fullText.includes('corrida') || fullText.includes('gt') || 
        fullText.includes('carro') || fullText.includes('volante')) {
      
      return "Dicas táticas e de gameplay esportivo na área! ⚽🏎️\n\n**Zaga no Futebol Virtual (EA FC/FIFA):**\n1. **Não avance seus zagueiros:** Mantenha a linha defensiva intacta. Controle os volantes para dar o combate no meio-campo.\n2. **Use o Jockey (L2/LT):** Fique de frente para o atacante cercando as opções de passe e chute ao invés de dar o bote seco pressionando o botão de desarme afoitamente.\n\n**Tração e Curvas (Jogos de Corrida):**\n- Siga a regra clássica: *Entrar devagar na curva, sair rápido dela*. Freie em linha reta antes da curva, pegue o ponto de tangência (apex) e retome a aceleração progressivamente para não derrapar.";
    }

    // Check Hardware/Otimização/Lag/FPS drops keywords
    if (fullText.includes('hardware') || fullText.includes('placa') || fullText.includes('rtx') || 
        fullText.includes('fps') || fullText.includes('lag') || fullText.includes('travando') || 
        fullText.includes('processador') || fullText.includes('driver') || fullText.includes('gargalo')) {
      
      return "Vamos otimizar essa máquina para garantir a maior taxa de quadros e estabilidade! 🖥️⚡\n\n**Checklist de Performance:**\n1. **Drivers da GPU:** Mantenha os drivers da NVIDIA/AMD/Intel sempre atualizados usando instalação limpa.\n2. **Memória RAM:** Verifique na BIOS se o perfil **XMP / DOCP / EXPO** está ativado. Caso contrário, suas memórias de alta velocidade estarão rodando na frequência básica do barramento.\n3. **Configurações de Energia:** Ajuste o plano de energia do Windows/Linux para 'Alto Desempenho'.\n4. **Configurações In-Game:** Efeitos volumétricos, sombras, ray tracing e oclusão de ambiente (AO) são os maiores comedores de performance. Reduza-os para 'Médio' ou 'Baixo' para ganho imediato de FPS.";
    }

    // Check Strategy keywords
    if (fullText.includes('estratégia') || fullText.includes('rts') || fullText.includes('civilization') || 
        fullText.includes('starcraft') || fullText.includes('age') || fullText.includes('recursos')) {
      
      return "Nos jogos de estratégia, o planejamento econômico determina a vitória no campo de batalha! 🧠♟️\n\n**Macro & Micro Control:**\n1. **Macroeconomia:** Nunca pare de produzir trabalhadores/coletores de recursos no início do jogo. Uma economia forte permite repor exércitos destruídos muito mais rápido que o oponente.\n2. **Atalhos (Hotkeys):** Decore os comandos de teclado para construir estruturas e treinar unidades. Cada segundo economizado conta na tomada de decisão em tempo real.\n3. **Scouting (Exploração):** Mantenha batedores ativos no mapa para monitorar o que seu inimigo está construindo. Adaptar sua estratégia ao exército inimigo é melhor do que seguir cegamente uma build rígida.";
    }

    // Check MOBA keywords
    if (fullText.includes('lol') || fullText.includes('league') || fullText.includes('dota') || 
        fullText.includes('moba') || fullText.includes('farm') || fullText.includes('rota') || 
        fullText.includes('gank')) {
      
      return "Dicas para subir de elo no MOBA! ⚔️🛡️\n\n**Fundamentos Essenciais:**\n1. **Foco no Farm:** Conseguir o golpe final nos minions (last hit) é a fonte de ouro mais estável. A meta deve ser de 8 a 10 minions por minuto.\n2. **Controle de Visão:** Coloque sentinelas (wards) nos pontos estratégicos do rio e nas entradas da selva. Conhecer a posição do caçador (jungler) inimigo previne mortes desnecessárias.\n3. **Objetivos sobre Kills:** Eliminar campeões inimigos é bom, mas o jogo se vence derrubando torres, dragões e o Nexus. Não persiga inimigos low-HP no mapa sem visão.";
    }

    // Fallback/Geral Gamer
    const generalTips = [
      `Fala, Operador! Sobre "${title}" na categoria **${category}**:\nA regra de ouro do gamer experiente é equilibrar prática e paciência. Se um jogo ou fase estiver muito difícil, faça uma pausa de 10 minutos para relaxar os reflexos. Tente mudar sua build, explorar caminhos alternativos e usar itens consumíveis que você normalmente ignora!`,
      `Muito interessante sua dúvida sobre games! Para dar uma dica precisa sobre **${category}**, lembre-se que estudar a mecânica básica de frames de ataque e defesa ajuda muito. Em jogos de ação e luta, o tempo de reação e a leitura dos movimentos do adversário são tudo. Experimente ir para a arena de treino para praticar o tempo correto de execução!`,
      `Dica do G-CORE AI especialista: para dominar jogos na categoria **${category}**, procure entender o 'meta' atualizado de patches. Desenvolvedores mudam o balanceamento com frequência, tornando certas armas ou personagens viáveis e nerfando outros. Pesquise pelas notas de atualização mais recentes do seu game!`
    ];
    
    return generalTips[Math.floor(Math.random() * generalTips.length)];
  };

  // Trigger Gemini API generate text
  const fetchGeminiResponse = async (doubt: ChatDoubt, newMessages: ChatMessage[]): Promise<string> => {
    try {
      // Map existing messages to Gemini format (user vs model)
      const apiContents = newMessages.map(msg => {
        return {
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        };
      });

      // Fetch with system instruction
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: apiContents,
          systemInstruction: {
            parts: [{ 
              text: "Você é o G-CORE AI, um chatbot especialista em games de última geração. Responda de forma empolgante, clara, informativa e com um toque gamer (use gírias de jogos ocasionalmente como 'GG WP', 'build', 'buffar', 'nerfar', 'checkpoints', mas de forma natural). Responda sempre em Português. Você entende de tudo: estratégias, lore de jogos, hardware de PC, consoles, FPS, RPGs, história dos videogames e dicas técnicas de configurações." 
            }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Nenhuma resposta válida recebida da IA do Gemini.');
      }
      
      return text;
    } catch (err: any) {
      console.error('Erro na API do Gemini:', err);
      throw err;
    }
  };

  // Trigger Puter.js API generate text (Keyless & Free)
  const fetchPuterResponse = async (doubt: ChatDoubt, newMessages: ChatMessage[]): Promise<string> => {
    const puterObj = (window as any).puter;
    if (!puterObj || !puterObj.ai) {
      throw new Error("Puter.js não está disponível. Aguarde o carregamento ou troque de modo.");
    }

    try {
      const puterMessages = [
        {
          role: "system",
          content: "Você é o G-CORE AI, um chatbot especialista em games de última geração. Responda em Português de forma descontraída, com inteligência e dicas técnicas sobre jogos, builds, hardware e estratégias."
        },
        ...newMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      const response = await puterObj.ai.chat(puterMessages, { model: puterModel });

      if (!response) throw new Error("Puter.ai retornou uma resposta vazia.");

      // Format 1: plain string
      if (typeof response === 'string') return response;

      // Format 2: { message: { content: string | ContentBlock[] } }
      if (response.message) {
        const content = response.message.content;
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
          // Anthropic-style content block array
          const text = content.map((block: any) => block.text || block.content || '').join('');
          if (text) return text;
        }
      }

      // Format 3: OpenAI-style { choices: [{ message: { content: string } }] }
      if (response.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
      }

      // Format 4: direct .text property
      if (response.text) return response.text;
      if (response.content && typeof response.content === 'string') return response.content;

      throw new Error('Formato de resposta do Puter.js não reconhecido.');
    } catch (err: any) {
      console.error('[G-CORE] Erro na API do Puter.js:', err);
      throw err;
    }
  };

  // Trigger Groq API (Free tier — https://console.groq.com)
  const fetchGroqResponse = async (doubt: ChatDoubt, newMessages: ChatMessage[]): Promise<string> => {
    try {
      const groqMessages = [
        {
          role: "system",
          content: "Você é o G-CORE AI, um chatbot especialista em games de última geração. Responda de forma empolgante, clara, informativa e com um toque gamer (use gírias de jogos ocasionalmente como 'GG WP', 'build', 'buffar', 'nerfar', mas de forma natural). Responda sempre em Português. Você entende de tudo: estratégias, lore de jogos, hardware de PC, consoles, FPS, RPGs, história dos videogames e dicas técnicas de configurações."
        },
        ...newMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          max_tokens: 1000,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Nenhuma resposta válida recebida do Groq.');
      return text;
    } catch (err: any) {
      console.error('[G-CORE] Erro na API do Groq:', err);
      throw err;
    }
  };

  // Handle Submit New Doubt
  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const newDoubtId = 'doubt-' + Math.random().toString(36).substring(2, 9);
    
    const userInitialMessage: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      content: `Dúvida: ${newTitle}\n\nDetalhes:\n${newDescription}`,
      timestamp: new Date().toISOString()
    };

    const newDoubt: ChatDoubt = {
      id: newDoubtId,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [userInitialMessage]
    };

    // Update state and active view
    setDoubts(prev => [newDoubt, ...prev]);
    setActiveDoubtId(newDoubtId);
    setIsModalOpen(false);
    
    // Clear inputs
    setNewTitle('');
    setNewCategory('Geral');
    setNewDescription('');

    // Trigger AI Response
    triggerChatbotResponse(newDoubt, [userInitialMessage]);
  };

  // Trigger chatbot response sequence
  const triggerChatbotResponse = async (doubt: ChatDoubt, messageHistory: ChatMessage[]) => {
    setIsTyping(true);
    
    // Update doubt status to answering
    setDoubts(prev => prev.map(d => d.id === doubt.id ? { ...d, status: 'answering' } : d));

    // Simulated network delay to show typing indicator (1.2s)
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      let botResponseText = '';
      let usedModelLabel = '';
      
      if (chatbotMode === 'groq' && isGroqApiKeySaved && groqApiKey.trim()) {
        botResponseText = await fetchGroqResponse(doubt, messageHistory);
        usedModelLabel = 'Llama 3.3 70B (Groq Free)';
      } else if (chatbotMode === 'gemini' && isApiKeySaved && apiKey.trim()) {
        botResponseText = await fetchGeminiResponse(doubt, messageHistory);
        usedModelLabel = 'Gemini 1.5 Flash (API Key)';
      } else if (chatbotMode === 'puter' && isPuterLoaded && (window as any).puter) {
        botResponseText = await fetchPuterResponse(doubt, messageHistory);
        usedModelLabel = `${puterModel} (Puter AI)`;
      } else {
        // Fallback local simulated expert
        botResponseText = generateOfflineResponse(doubt.title, doubt.description, doubt.category);
        usedModelLabel = 'Simulador G-CORE (Offline)';
      }

      const botMessage: ChatMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        sender: 'bot',
        content: botResponseText,
        timestamp: new Date().toISOString(),
        modelUsed: usedModelLabel
      };

      setDoubts(prev => prev.map(d => {
        if (d.id === doubt.id) {
          return {
            ...d,
            status: 'answered',
            messages: [...d.messages, botMessage]
          };
        }
        return d;
      }));
    } catch (err: any) {
      console.warn("Erro ao obter resposta da IA, usando fallback do Simulador:", err);
      
      // Automatic Fallback to Simulator if Puter/Gemini fails
      const fallbackText = generateOfflineResponse(doubt.title, doubt.description, doubt.category);
      
      const botMessage: ChatMessage = {
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        sender: 'bot',
        content: `*(Aviso: Houve uma falha ao contatar a IA online: ${err.message || 'Erro de conexão'}. Resposta gerada via Simulador Local fallback)*\n\n${fallbackText}`,
        timestamp: new Date().toISOString(),
        modelUsed: 'Simulador Local (Fallback)'
      };

      setDoubts(prev => prev.map(d => {
        if (d.id === doubt.id) {
          return {
            ...d,
            status: 'answered', // Mark as answered anyway to let them see fallback
            messages: [...d.messages, botMessage]
          };
        }
        return d;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  // Handle follow up message submission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeDoubtId || isTyping) return;

    const currentDoubt = doubts.find(d => d.id === activeDoubtId);
    if (!currentDoubt) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...currentDoubt.messages, userMessage];

    // Add user message to doubt, set status to answering
    setDoubts(prev => prev.map(d => {
      if (d.id === activeDoubtId) {
        return {
          ...d,
          status: 'answering',
          messages: updatedMessages
        };
      }
      return d;
    }));

    setInputText('');
    
    // Trigger response for follow up
    triggerChatbotResponse({
      ...currentDoubt,
      messages: updatedMessages
    }, updatedMessages);
  };

  // Delete Doubt
  const handleDeleteDoubt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja realmente remover esta dúvida e todo seu histórico de conversa?')) {
      setDoubts(prev => prev.filter(d => d.id !== id));
      if (activeDoubtId === id) {
        setActiveDoubtId(null);
      }
    }
  };

  const activeDoubt = doubts.find(d => d.id === activeDoubtId);

  // Status Badge styles
  const getStatusBadge = (status: ChatDoubt['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-400 animate-pulse">PENDENTE</span>;
      case 'answering':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#f97316]/10 text-[#f97316] animate-pulse">ANALISANDO...</span>;
      case 'answered':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#91db2a]/10 text-[#91db2a] flex items-center gap-1"><CheckCircle size={10} /> RESPONDIDA</span>;
      case 'error':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400">ERRO</span>;
      default:
        return null;
    }
  };

  const getModeLabel = () => {
    switch (chatbotMode) {
      case 'groq':
        return isGroqApiKeySaved ? 'GROQ AI (LLAMA 3.3 70B)' : 'GROQ AI (SEM CHAVE)';
      case 'puter':
        return isPuterLoaded ? `PUTER AI (${puterModel})` : 'PUTER AI (CARREGANDO...)';
      case 'gemini':
        return 'GEMINI CLOUD API';
      case 'offline':
      default:
        return 'SIMULADOR OFFLINE';
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 md:gap-8 min-h-[calc(100vh-120px)] relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full opacity-[0.03] blur-3xl pointer-events-none" style={{ backgroundColor: colorsSet.accentColorHex }} />
      
      {/* Title & Top Configuration Section */}
      <div className="border-b border-[#cfc2d6]/10 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[#e5e2e1] tracking-tight mb-2 flex items-center gap-2.5">
            <Gamepad2 className={colorsSet.primaryText} size={28} />
            Especialista G-CORE AI
          </h2>
          <p className="text-body-sm text-[#cfc2d6]/60 leading-relaxed max-w-2xl">
            Tire suas dúvidas sobre táticas, builds e hardware. Use modelos avançados online de graça.
          </p>
        </div>

        {/* Settings/Mode Button */}
        <button
          onClick={() => setShowApiSettings(!showApiSettings)}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-mono font-bold rounded-lg border border-[#cfc2d6]/15 hover:bg-[#201f1f] text-[#cfc2d6] hover:text-[#e5e2e1] transition-all cursor-pointer`}
        >
          <Cpu size={14} className="text-[#4cd7f6] animate-pulse" />
          <span>MODO: {getModeLabel()}</span>
        </button>
      </div>

      {/* Dynamic Chatbot Configuration Panel */}
      {showApiSettings && (
        <div className="bg-[#201f1f]/50 border border-[#cfc2d6]/15 rounded-xl p-5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200 flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Settings className={colorsSet.primaryText} size={16} />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#e5e2e1]">Configurações do Especialista AI</h4>
            </div>
            <button 
              onClick={() => setShowApiSettings(false)}
              className="text-[#cfc2d6]/50 hover:text-[#e5e2e1] p-1 rounded hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-[#cfc2d6]/10 pb-4">
            <button
              onClick={() => setChatbotMode('groq')}
              className={`px-3 py-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                chatbotMode === 'groq'
                  ? `${colorsSet.primaryBg} text-[#131313] ${colorsSet.glowClass}`
                  : 'bg-[#1A1A1A] text-[#cfc2d6]/60 hover:text-[#e5e2e1]'
              }`}
            >
              ⚡ Groq AI (Llama 3 — Grátis)
            </button>
            <button
              onClick={() => setChatbotMode('puter')}
              className={`px-3 py-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                chatbotMode === 'puter'
                  ? `${colorsSet.primaryBg} text-[#131313] ${colorsSet.glowClass}`
                  : 'bg-[#1A1A1A] text-[#cfc2d6]/60 hover:text-[#e5e2e1]'
              }`}
            >
              🤖 Puter (Sem Chave)
            </button>
            <button
              onClick={() => setChatbotMode('gemini')}
              className={`px-3 py-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                chatbotMode === 'gemini'
                  ? `${colorsSet.primaryBg} text-[#131313] ${colorsSet.glowClass}`
                  : 'bg-[#1A1A1A] text-[#cfc2d6]/60 hover:text-[#e5e2e1]'
              }`}
            >
              🔑 Gemini API
            </button>
            <button
              onClick={() => setChatbotMode('offline')}
              className={`px-3 py-2 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                chatbotMode === 'offline'
                  ? `${colorsSet.primaryBg} text-[#131313] ${colorsSet.glowClass}`
                  : 'bg-[#1A1A1A] text-[#cfc2d6]/60 hover:text-[#e5e2e1]'
              }`}
            >
              🔌 Simulador Offline
            </button>
          </div>

          {/* Render Mode Content */}
          {chatbotMode === 'groq' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#4cd7f6] text-xs font-mono font-bold">
                <Sparkles size={14} />
                <span>GROQ AI — LLAMA 3.3 70B (GRATUITO COM CHAVE)</span>
              </div>
              <p className="text-xs text-[#cfc2d6]/60 leading-relaxed font-mono">
                Groq oferece acesso gratuito e ultra-rápido ao modelo <strong className="text-[#e5e2e1]">Llama 3.3 70B</strong> via API key.
                Cadastre-se gratuitamente em{' '}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4cd7f6] underline hover:text-cyan-400 font-bold"
                >
                  console.groq.com
                </a>{' '}
                e gere sua chave em "API Keys". Tier gratuito é generoso para uso pessoal.
              </p>

              <form onSubmit={handleSaveGroqKey} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full flex-grow">
                  <input
                    type={showGroqApiKey ? 'text' : 'password'}
                    placeholder="Cole sua Groq API Key aqui (gsk_...)..."
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b border-[#cfc2d6]/20 px-3.5 py-2.5 pr-10 focus:outline-none focus:bg-[#201f1f] text-xs font-mono rounded ${colorsSet.borderFocus} transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqApiKey(!showGroqApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40 hover:text-[#e5e2e1]"
                  >
                    {showGroqApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                  {isGroqApiKeySaved && (
                    <button
                      type="button"
                      onClick={handleClearGroqKey}
                      className="px-4 py-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      LIMPAR
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded text-[#131313] font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
                  >
                    SALVAR CHAVE
                  </button>
                </div>
              </form>

              {isGroqApiKeySaved && (
                <div className="flex items-center gap-1.5 text-[#91db2a] font-mono text-[10px] uppercase font-bold">
                  <CheckCircle size={12} />
                  <span>Groq API Key Ativa! Llama 3.3 70B pronto para uso.</span>
                </div>
              )}
            </div>
          )}

          {/* Render Mode Content */}
          {chatbotMode === 'puter' && (
            <div className="flex flex-col gap-3 animate-in fade-in duration-200">
              <div className={`flex items-center gap-2 text-xs font-mono font-bold ${isPuterLoaded ? 'text-[#4cd7f6]' : 'text-yellow-400'}`}>
                <Sparkles size={14} />
                <span>
                  {isPuterLoaded
                    ? 'PUTER AI CARREGADO — SEM NECESSIDADE DE CHAVE'
                    : 'CARREGANDO SDK DO PUTER.JS... AGUARDE'}
                </span>
              </div>
              {!isPuterLoaded && (
                <div className="flex items-center gap-2 p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-[10px] font-mono text-yellow-400/80">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>
                    O script Puter.js está sendo carregado dinamicamente. Se não carregar, verifique sua conexão
                    ou adicione <code className="bg-black/30 px-1 rounded">&lt;script src="https://js.puter.com/v2/"&gt;&lt;/script&gt;</code> manualmente no seu <code className="bg-black/30 px-1 rounded">index.html</code>.
                  </span>
                </div>
              )}
              <p className="text-xs text-[#cfc2d6]/60 leading-relaxed font-mono">
                Modo 100% gratuito sem API key via Puter.js SDK. Selecione o modelo desejado abaixo.
                A disponibilidade depende de login no Puter — se falhar, use o modo <strong className="text-[#e5e2e1]">Groq</strong>.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
                <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest shrink-0">
                  Modelo Selecionado:
                </label>
                <select
                  value={puterModel}
                  onChange={(e) => setPuterModel(e.target.value)}
                  disabled={!isPuterLoaded}
                  className="bg-[#1A1A1A] text-[#e5e2e1] border border-[#cfc2d6]/20 px-3 py-2 rounded focus:outline-none focus:bg-[#201f1f] text-xs font-mono min-w-[200px] cursor-pointer disabled:opacity-50"
                >
                  {puterModelsList.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {chatbotMode === 'gemini' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#f97316] text-xs font-mono font-bold">
                <Key size={14} />
                <span>GOOGLE GEMINI 1.5 FLASH (GRATUITO COM CHAVE)</span>
              </div>
              <p className="text-xs text-[#cfc2d6]/60 leading-relaxed font-mono">
                Conecta diretamente ao modelo <strong className="text-[#e5e2e1]">Gemini 1.5 Flash</strong> do Google.
                Sua chave fica salva apenas no navegador. Obtenha uma gratuitamente em{' '}
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#4cd7f6] underline hover:text-cyan-400 font-bold"
                >
                  Google AI Studio
                </a>.
              </p>

              <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full flex-grow">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Cole sua Gemini API Key aqui..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b border-[#cfc2d6]/20 px-3.5 py-2.5 pr-10 focus:outline-none focus:bg-[#201f1f] text-xs font-mono rounded ${colorsSet.borderFocus} transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#cfc2d6]/40 hover:text-[#e5e2e1]"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                  {isApiKeySaved && (
                    <button
                      type="button"
                      onClick={handleClearApiKey}
                      className="px-4 py-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      LIMPAR
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded text-[#131313] font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
                  >
                    SALVAR CHAVE
                  </button>
                </div>
              </form>

              {isApiKeySaved && (
                <div className="flex items-center gap-1.5 text-[#91db2a] font-mono text-[10px] uppercase font-bold">
                  <CheckCircle size={12} />
                  <span>API Key Ativada! Pronto para uso.</span>
                </div>
              )}
            </div>
          )}

          {chatbotMode === 'offline' && (
            <div className="flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#cfc2d6] text-xs font-mono font-bold">
                <Info size={14} />
                <span>MODO SIMULADOR DE RESPOSTAS OFFLINE</span>
              </div>
              <p className="text-xs text-[#cfc2d6]/60 leading-relaxed font-mono">
                Funciona sem qualquer conexão com a internet. O sistema utiliza lógica de processamento local que vasculha termos da sua dúvida e gera respostas prontas e ricas em detalhes baseando-se em inteligência local estática. Ideal para testes rápidos sem depender de latência de rede.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-grow min-h-[500px]">
        
        {/* Left Side: Doubts List Panel */}
        <div className={`lg:col-span-1 bg-[#201f1f]/35 border border-[#cfc2d6]/15 rounded-xl flex flex-col p-4 shadow-xl ${activeDoubtId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-[#cfc2d6]/10 mb-4">
            <h3 className="font-display text-sm font-bold text-[#e5e2e1] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} className={colorsSet.primaryText} />
              Histórico de Dúvidas
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`p-1.5 rounded-lg text-[#131313] hover:brightness-110 transition-all active:scale-95 cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
              title="Nova Dúvida"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Scrollable Doubt list items */}
          <div className="flex-grow overflow-y-auto flex flex-col gap-3 max-h-[550px] pr-1">
            {doubts.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#cfc2d6]/10 rounded-lg py-12">
                <span className="text-3xl mb-3">💬</span>
                <h4 className="text-xs font-mono font-bold text-[#e5e2e1] mb-1">Nenhuma dúvida registrada</h4>
                <p className="text-[11px] text-[#cfc2d6]/50 max-w-[180px] leading-relaxed">
                  Adicione sua primeira pergunta para o especialista em games.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`mt-4 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all border border-dashed border-[#cfc2d6]/20 hover:border-[#f97316]/50 text-[#cfc2d6] hover:text-[#e5e2e1] cursor-pointer`}
                >
                  Criar Dúvida
                </button>
              </div>
            ) : (
              doubts.map(doubt => {
                const isActive = doubt.id === activeDoubtId;
                const lastMessage = doubt.messages[doubt.messages.length - 1];
                
                return (
                  <div
                    key={doubt.id}
                    onClick={() => setActiveDoubtId(doubt.id)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all duration-300 relative group flex flex-col gap-2 ${
                      isActive 
                        ? `bg-[#f97316]/5 border-[#f97316]/40 ${colorsSet.glowClass}` 
                        : 'bg-[#1A1A1A]/50 border-[#cfc2d6]/10 hover:border-[#cfc2d6]/20 hover:bg-[#201f1f]/20'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-mono text-[#cfc2d6]/40 uppercase tracking-widest font-semibold truncate max-w-[100px]">
                        {doubt.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(doubt.status)}
                        <button
                          onClick={(e) => handleDeleteDoubt(doubt.id, e)}
                          className="text-[#cfc2d6]/30 hover:text-red-400 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100"
                          title="Remover Dúvida"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <h4 className={`text-xs font-bold font-display truncate ${isActive ? colorsSet.primaryText : 'text-[#e5e2e1]'}`}>
                      {doubt.title}
                    </h4>

                    {lastMessage && (
                      <p className="text-[10px] text-[#cfc2d6]/50 truncate line-clamp-1">
                        {lastMessage.sender === 'user' ? 'Você: ' : 'AI: '}
                        {lastMessage.content.replace(/(\*\*|###|⚔️|⚡|🎯|⚽|🖥️)/g, '')}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-[9px] text-[#cfc2d6]/30 font-mono mt-1">
                      <Clock size={10} />
                      <span>{formatDate(doubt.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Window Panel */}
        <div className={`lg:col-span-2 bg-[#201f1f]/35 border border-[#cfc2d6]/15 rounded-xl flex flex-col shadow-xl overflow-hidden ${!activeDoubtId ? 'hidden lg:flex' : 'flex'}`}>
          {activeDoubt ? (
            <div className="flex flex-col h-full min-h-[500px]">
              
              {/* Chat Panel Header */}
              <div className="px-5 py-4 border-b border-[#cfc2d6]/10 bg-[#1A1A1A]/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setActiveDoubtId(null)}
                    className="lg:hidden p-1.5 rounded-lg text-[#cfc2d6]/70 hover:text-[#e5e2e1] hover:bg-white/5"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold text-[#e5e2e1] truncate flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                      {activeDoubt.title}
                    </h3>
                    <p className="text-[10px] font-mono text-[#cfc2d6]/40 uppercase tracking-widest mt-0.5">
                      Categoria: {activeDoubt.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(activeDoubt.status)}
                </div>
              </div>

              {/* Chat Message Thread History */}
              <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 max-h-[400px] min-h-[300px]">
                {activeDoubt.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`p-3.5 rounded-xl text-xs font-sans leading-relaxed border select-text whitespace-pre-wrap ${
                          isUser
                            ? 'bg-[#f97316]/10 border-[#f97316]/20 text-[#e5e2e1] rounded-tr-none'
                            : 'bg-[#2a2a2a]/60 border-[#cfc2d6]/10 text-[#e5e2e1] rounded-tl-none font-mono text-[11px]'
                        }`}
                      >
                        {msg.content}

                        {/* Display Model Capsule used in Chat */}
                        {!isUser && msg.modelUsed && (
                          <div className="mt-2.5 pt-2 border-t border-[#cfc2d6]/10 flex items-center gap-1.5 text-[9px] font-mono text-[#cfc2d6]/40 uppercase tracking-wider">
                            <Sparkles size={10} className="text-[#4cd7f6]" />
                            <span>Modelo: {msg.modelUsed}</span>
                          </div>
                        )}
                      </div>

                      {/* Message Timestamp */}
                      <span className="text-[9px] text-[#cfc2d6]/30 font-mono mt-1 px-1">
                        {isUser ? 'Você' : 'G-CORE AI'} • {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  );
                })}

                {/* Chatbot Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col max-w-[85%] self-start items-start animate-pulse">
                    <div className="p-3 bg-[#2a2a2a]/60 border border-[#cfc2d6]/10 text-[#cfc2d6] rounded-xl rounded-tl-none flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cfc2d6]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cfc2d6]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#cfc2d6]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[10px] font-mono ml-1 text-[#cfc2d6]/50">
                        {chatbotMode === 'offline' ? 'Simulador analisando...' : 'IA analisando requisição...'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Entry Input Form */}
              <form 
                onSubmit={handleSendMessage} 
                className="p-4 border-t border-[#cfc2d6]/10 bg-[#1A1A1A]/20 flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder={
                    activeDoubt.status === 'answering'
                      ? "Aguarde a resposta da inteligência artificial..."
                      : `Digitando pelo modelo ${chatbotMode === 'offline' ? 'Simulador' : (chatbotMode === 'gemini' ? 'Gemini' : puterModel)}...`
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={activeDoubt.status === 'answering' || isTyping}
                  className={`flex-grow bg-[#1A1A1A] text-[#e5e2e1] border-b border-[#cfc2d6]/15 px-3.5 py-3 text-xs focus:outline-none focus:bg-[#201f1f] rounded ${
                    colorsSet.borderFocus
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                />
                
                <button
                  type="submit"
                  disabled={!inputText.trim() || activeDoubt.status === 'answering' || isTyping}
                  className={`p-3 rounded-lg text-[#131313] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:brightness-100 cursor-pointer ${
                    colorsSet.primaryBg
                  } ${colorsSet.glowClass}`}
                >
                  <Send size={16} />
                </button>
              </form>

            </div>
          ) : (
            // Empty / Blank Chat State
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 py-20">
              <div className="w-16 h-16 rounded-full bg-[#1c1b1b] border border-[#cfc2d6]/10 flex items-center justify-center mb-6">
                <Sparkles size={28} className={colorsSet.primaryText} />
              </div>
              <h3 className="font-display text-base font-bold text-[#e5e2e1] mb-2">Painel de Respostas do Especialista</h3>
              <p className="text-xs text-[#cfc2d6]/50 max-w-sm leading-relaxed mb-6">
                Selecione uma dúvida na barra lateral ou cadastre uma nova para interagir com o chatbot.
              </p>

              {/* Suggestions chips grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setNewTitle('Como passar da Malenia em Elden Ring?');
                    setNewCategory('RPG / MMORPG');
                    setNewDescription('Estou travado na segunda fase dela. Alguma recomendação de build ou estratégia para esquivar do golpe de giros rápidos no ar?');
                  }}
                  className="p-3 bg-[#1A1A1A]/40 border border-[#cfc2d6]/10 rounded-lg hover:border-[#cfc2d6]/25 text-left text-[11px] font-mono text-[#cfc2d6]/70 hover:text-[#e5e2e1] transition-all cursor-pointer"
                >
                  ⚔️ Elden Ring / Souls Tips
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setNewTitle('Como tirar o lag de jogos competitivos?');
                    setNewCategory('Hardware / Otimização');
                    setNewDescription('Tenho quedas constantes de FPS (stuttering) no meio de confrontos no CS2/Valorant. Como otimizar meu sistema e drivers de vídeo?');
                  }}
                  className="p-3 bg-[#1A1A1A]/40 border border-[#cfc2d6]/10 rounded-lg hover:border-[#cfc2d6]/25 text-left text-[11px] font-mono text-[#cfc2d6]/70 hover:text-[#e5e2e1] transition-all cursor-pointer"
                >
                  🖥️ Otimizar Hardware / FPS
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal Overlay to Add New Doubt */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          {/* Modal Panel Container */}
          <div className="relative w-full max-w-[480px] bg-[#131313] border border-[#cfc2d6]/20 rounded-xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#cfc2d6]/10 mb-5">
              <h3 className="font-display text-sm font-bold text-[#e5e2e1] uppercase tracking-widest flex items-center gap-2">
                <Plus size={16} className={colorsSet.primaryText} />
                Cadastrar Nova Dúvida
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#cfc2d6]/50 hover:text-[#e5e2e1] p-1 rounded hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDoubt} className="flex flex-col gap-4 font-sans text-xs">
              
              {/* Category Select Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest">
                  Categoria do Jogo
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#1A1A1A] text-[#e5e2e1] border-b border-[#cfc2d6]/20 px-3 py-2.5 rounded focus:outline-none focus:bg-[#201f1f] text-xs font-mono"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Title input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest">
                  Título da Dúvida
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Melhor sensibilidade in-game para FPS"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b border-[#cfc2d6]/20 px-3.5 py-2.5 rounded focus:outline-none focus:bg-[#201f1f] text-xs ${colorsSet.borderFocus} transition-all`}
                />
              </div>

              {/* Description textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-medium text-[#cfc2d6]/60 uppercase tracking-widest">
                  Descreva sua dúvida com detalhes
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva qual o seu problema, jogo específico, o que já tentou fazer e detalhes para o especialista gamer responder..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className={`w-full bg-[#1A1A1A] text-[#e5e2e1] border-b border-[#cfc2d6]/20 px-3.5 py-2.5 rounded focus:outline-none focus:bg-[#201f1f] text-xs resize-none ${colorsSet.borderFocus} transition-all`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#cfc2d6]/10 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 rounded hover:bg-[#201f1f] text-[#cfc2d6] text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className={`px-5 py-3 rounded text-[#131313] font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer ${colorsSet.primaryBg} ${colorsSet.glowClass}`}
                >
                  ENVIAR PERGUNTA
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
