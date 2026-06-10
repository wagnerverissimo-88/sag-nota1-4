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
  dailyFreeTime: number; 
}

export type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

export type ActiveTab = 'DASHBOARD' | 'USERS' | 'GAMES' | 'CHATBOT';

// Jogo salvo localmente pelo usuário
export interface Game {
  id: string;
  name: string;
  genre: string;
  platforms: string[];
  rating: number | null;
  releaseYear: number | null;
  coverUrl: string | null;
  rawgId: number | null;
}

// Formato de resposta da RAWG API (autocomplete)
export interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  genres: { id: number; name: string }[];
  platforms: { platform: { id: number; name: string } }[] | null;
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

