export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber: string;
  displayName: string;
  role: 'admin' | 'user';
  balance: number;
  createdAt: string;
}

export interface GameSession {
  id: string;
  userId: string;
  bet: number;
  win: number;
  reels: number[][];
  timestamp: string;
}

export type SlotSymbol = 'cherry' | 'lemon' | 'orange' | 'plum' | 'bell' | 'seven' | 'diamond';

export interface ReelConfig {
  symbols: SlotSymbol[];
}
