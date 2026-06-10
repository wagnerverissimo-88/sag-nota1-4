export interface UserPreferences {
  primaryColor: 'orange' | 'purple' | 'cyan' | 'magenta' | 'green';
  bgPattern: boolean;
  avatarSelection: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl: string;
  preferences: UserPreferences;
}

export type GameCategory = string;

export interface Gamer {
  id: string;
  name: string;
  age: number;
  preferredGame: string;
  category: GameCategory;
  platform: GamerPlatform;
  dailyFreeTime: number;
}

export type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

export type ActiveTab = 'DASHBOARD' | 'USERS' | 'GAMES' | 'CHATBOT';

export type GamerPlatform = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo Switch' | 'Mobile' | 'Multi-Plataforma';

export const GAMER_PLATFORMS: GamerPlatform[] = [
  'PC',
  'PlayStation',
  'Xbox',
  'Nintendo Switch',
  'Mobile',
  'Multi-Plataforma',
];

// Jogo cadastrado manualmente pelo usuário
export interface Game {
  id: string;
  name: string;
  category: string;
  rating: number | null; // Nota de 0 a 10
  notes: string;         // Observações extras
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface ChatDoubt {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'answering' | 'answered' | 'error';
  createdAt: string;
  messages: ChatMessage[];
}

