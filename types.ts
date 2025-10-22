
export interface Drink {
  id: string;
  name: string;
  price: number;
}

export interface Player {
  id: string;
  name: string;
  phone?: string;
  consumedDrinks: Record<string, number>; // Replaces waterBottles
  isGuest?: boolean;
  quantity?: number;
  adjustment: {
    amount: number;
    reason: string;
  };
  isPaid: boolean;
}

export interface PlayerDetails extends Player {
  totalCost: number;
  losses: number;
  drinksCost: number; // Replaces waterCost
  shuttlecockCost: number;
}

export interface SessionSummary {
  totalCourtFee: number;
  totalDrinksCost: number; // Replaces totalWaterCost
  totalShuttlecockCost: number;
  grandTotal: number;
}

export interface Session {
  id: string;
  date: string;
  players: PlayerDetails[];
  gameType: 'practice' | 'singles' | 'doubles';
  summary: SessionSummary;
}