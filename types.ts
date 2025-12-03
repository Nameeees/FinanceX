

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  icon?: string;
  description?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  icon: string;
}

export interface DailySummary {
  date: string;
  transactions: Transaction[];
}

export enum DebtType {
  LENT = 'LENT', // Preste dinero (Me deben)
  BORROWED = 'BORROWED' // Pedi dinero (Debo)
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  transactionId?: string; // Link to the history transaction
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  paidAmount: number;
  type: DebtType;
  dueDate?: string;
  description?: string;
  initialTransactionId?: string; // Link to the creation transaction
  payments: DebtPayment[];
}

export type SecurityMethod = 'PIN' | 'PASSWORD' | 'PATTERN';

export type CloudProvider = 'GITHUB' | 'JSONBIN';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  currency: string;
  timezone?: string;
  monthlyGoal: number;
  security: {
    enabled: boolean;
    method: SecurityMethod;
    value: string;
  };
  cloudConfig?: {
    enabled: boolean;
    provider: CloudProvider;
    apiKey: string; // Token for GitHub or Master Key for JSONBin
    binId: string; // Gist ID or Bin ID
    lastSync?: string;
  };
}

export interface Sheet {
  id: string;
  name: string;
  data: Record<string, string>;
  lastModified: string;
  color?: string; // Optional aesthetic color
}

// Custom Trackers & Blueprint Types
export type TrackerType = 
    | 'COUNTER' | 'MANUAL' | 'TIMER' | 'MULTIPLIER' | 'HOUR_BANK' | 'POMODORO' | 'LIQUID' | 'PROGRESS' 
    | 'IMPULSE_SAVED' | 'ASSET_VALUE' | 'SUBSCRIPTION' | 'DEBT_SNOWBALL' | 'CREDIT_GAUGE' | 'ROI_CALC' 
    | 'SAVINGS_BINGO' | 'BLUEPRINT' | 'TAX_RESERVE' | 'NET_SCORE' | 'DECREMENT' | 'DAILY_BUDGET' 
    | 'RANGE' | 'CHECKLIST' | 'BILL' | 'EMOJI' | 'RATING' | 'BINARY' | 'STREAK' | 'NO_SPEND' 
    | 'COUNTDOWN_DATE';

export type ResetFrequency = 'NEVER' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type WidgetLayout = 'SQUARE' | 'WIDE';

export interface TrackerLog {
  id: string;
  date: string;
  value: number;
  note?: string;
}

export interface BlueprintPort {
    id: string;
    name: string;
    type: 'EXEC' | 'NUMBER' | 'BOOLEAN' | 'STRING';
}

export interface BlueprintNode {
    id: string;
    type: string;
    title: string;
    position: { x: number, y: number };
    data: any;
    inputs: BlueprintPort[];
    outputs: BlueprintPort[];
}

export interface BlueprintConnection {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
}

export interface Blueprint {
    nodes: BlueprintNode[];
    connections: BlueprintConnection[];
    viewport: { x: number, y: number, zoom: number };
}

export interface CustomTracker {
  id: string;
  name: string;
  type: TrackerType;
  config: any;
  icon: string;
  color: string;
  target: number;
  unit: string;
  resetSchedule: ResetFrequency;
  layout: WidgetLayout;
  blueprint?: Blueprint;
  currentValue: number;
  lastUpdated: string;
  logs: TrackerLog[];
}