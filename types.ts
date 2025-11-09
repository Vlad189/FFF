export type ProductId = 'cream' | 'tonic' | 'serum' | 'serum_deluxe' | 'berry_mask';

export const PRODUCT_DETAILS: Record<ProductId, { name: string, shortName: string, ingredients: { lemons: number, sugar: number, bottles: number, oil?: number, berries?: number }, cost: number }> = {
    cream: { name: 'Лимонний крем для обличчя', shortName: 'Крем', ingredients: { lemons: 3, sugar: 1, bottles: 1 }, cost: 8 },
    tonic: { name: 'Тонік з екстрактом лимона', shortName: 'Тонік', ingredients: { lemons: 2, sugar: 0, bottles: 1 }, cost: 6 },
    serum: { name: 'Екофрендлі сироватка Вітамін С', shortName: 'Сироватка', ingredients: { lemons: 4, sugar: 2, bottles: 1 }, cost: 12 },
    serum_deluxe: { name: 'Люкс-сироватка "Цитрус-Еліксир"', shortName: 'Люкс-сироватка', ingredients: { lemons: 5, sugar: 2, bottles: 1, oil: 2 }, cost: 25 },
    berry_mask: { name: 'Ягідна маска-детокс', shortName: 'Ягідна маска', ingredients: { lemons: 2, sugar: 1, bottles: 1, berries: 5 }, cost: 18 },
};

export const INGREDIENT_PRICES: Record<keyof Omit<Inventory, 'products'>, number> = {
    lemons: 2,
    sugar: 1,
    bottles: 3,
    oil: 10,
    berries: 4,
};

export interface Inventory {
  lemons: number;
  sugar: number;
  bottles: number;
  oil: number;
  berries: number;
  products: Record<ProductId, number>;
}

export interface ResearchProject {
    id: ProductId;
    name: string;
    description: string;
    cost: number;
    duration: number; // in days
}

// --- New Company Management Types ---

export interface Warehouse {
    id: string;
    name: string;
    capacity: number;
    dailyCost: number;
}

export type EmployeeSkill = 'Виробництво' | 'Маркетинг' | 'Продажі' | 'Хімія' | 'Дизайн' | 'Якість' | 'Косметолог';

export interface Employee {
    id: string;
    name: string;
    skill: EmployeeSkill;
    efficiencyBonus: number; // e.g., 0.05 for 5%
    salary: number; // daily
    loyalty: number; // 0 to 1, affects poaching chance
    morale: number; // 0 to 1, affects positive/negative events
}

export type CompanyStructureId = 'fair_stall' | 'small_shop' | 'llc' | 'pjsc';

export interface CompanyStructure {
    id: CompanyStructureId;
    name: string;
    employeeLimit: number;
    warehouseLimit: number;
    upgradeCost: number;
    upgradeReq: { money?: number, marketShare?: number };
    description: string;
}

export interface Discount {
    percentage: number; // e.g. 0.1 for 10%
    daysRemaining: number;
}

export interface OrgChartNode {
    id: string;
    name: string;
    employees: string[];
    children: OrgChartNode[];
}

export interface LogEntry {
    message: string;
    type: 'success' | 'danger' | 'info' | 'event';
}

export interface PlayerState {
  money: number;
  inventory: Inventory;
  prices: Record<ProductId, number>;
  warehouses: Warehouse[];
  employees: Employee[];
  companyStructure: CompanyStructureId;
  unlockedProducts: ProductId[];
  activeResearch: { projectId: ProductId; daysRemaining: number } | null;
  discounts: Partial<Record<ProductId, Discount>>;
  blockedUsers: string[];
}

export interface Competitor {
  name:string;
  icon: string;
  prices: Record<ProductId, number>;
  marketShare: number; // in percent
  activeCampaign: AdCampaign | null;
  unlockedProducts: ProductId[];
  employees: Employee[];
}

export interface SimulatedComment {
    author: string;
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    isBot?: boolean;
    replies?: { author: string; text: string; }[];
}

export interface SocialMediaPost {
    id: string;
    day: number;
    author: string; // 'player' or competitor name
    authorIcon?: string;
    content: string;
    comments: SimulatedComment[];
}

export interface AdCampaign {
    type: 'social_media' | 'billboards' | 'radio' | 'smear';
    name: string;
    duration: number;
    cost: number;
    daysRemaining: number;
    effectMultiplier: number; // e.g., 1.2 for a 20% boost
}

export interface SocialMediaState {
    posts: SocialMediaPost[];
    activeCampaign: AdCampaign | null;
    pinnedPostId: string | null;
    boostedPosts: { postId: string, daysRemaining: number }[];
}

export interface GameState {
  day: number;
  player: PlayerState;
  competitors: Competitor[];
  log: LogEntry[];
  market: {
      playerShare: number;
      lastEvent: MarketEvent | null;
      eventQueue: MarketEvent[];
      inflationRate: number;
      currentIngredientPrices: Record<keyof Omit<Inventory, 'products'>, number>;
  }
  socialMedia: SocialMediaState;
  availableEmployees: Employee[];
  orgChart: OrgChartNode | null;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export type CompetitorSWOT = Record<string, SWOTAnalysis>;

export interface CompetitorAnalysisData {
    companyName: string;
    location: string;
    contactInfo: string;
    links: string;
    employees: string;
    annualSales: string;
    revenue: string;
    businessValue: string;
    stockValue: string;
}

export interface GanttTask {
    id: string;
    name: string;
    startDay: number;
    endDay: number;
    isCompleted: boolean;
}

export interface FinancialProjectionRow {
    id: string;
    period: string;
    capital: number;
    income: number;
    expenses: number;
    additionalExpenses: number;
    netIncome: number;
}

export interface BusinessPlan {
    goals: string[];
    financialProjections: FinancialProjectionRow[];
    ganttTasks: GanttTask[];
}

// FIX: Add CalendarEvent type for use in CalendarModal.
export interface CalendarEvent {
    day: number;
    title: string;
    type: 'research' | 'marketing' | 'discount' | 'market';
}

// --- History Types ---
export interface HistoricalData<T> {
    day: number;
    data: T;
}

export type BusinessPlanHistory = HistoricalData<BusinessPlan>[];
export type SwotHistory = HistoricalData<SWOTAnalysis>[];
export type CompAnalysisHistory = HistoricalData<CompetitorAnalysisData[]>[];


// --- Market Event Types ---
export interface MarketEvent {
    id: string;
    message: string;
    type: 'positive' | 'negative' | 'neutral';
    effect: {
        demandMultiplier?: number;
        priceSensitivityMultiplier?: number;
        productDemandMultiplier?: Partial<Record<ProductId, number>>;
        costMultiplier?: number;
        inflationMultiplier?: number; // For hyperinflation
        stabilizationFactor?: number; // For anti-inflation
    };
    // FIX: Add optional scheduledDay for calendar events.
    scheduledDay?: number;
}