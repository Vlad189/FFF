import React, { useState, ReactNode, useEffect, useMemo } from 'react';
import { GameState, SWOTAnalysis, BusinessPlan, ProductId, PRODUCT_DETAILS, GanttTask, BusinessPlanHistory, SwotHistory, MarketEvent, INGREDIENT_PRICES, Inventory, FinancialProjectionRow, ResearchProject, AdCampaign, SocialMediaPost, Warehouse, Employee, CompanyStructure, CompanyStructureId, Discount, OrgChartNode, EmployeeSkill, CompetitorAnalysisData, CompAnalysisHistory, LogEntry } from './types';
import { generateDynamicSwot, generateBusinessPlan, generateCompetitorAnalysisGrid, generateSocialMediaComments, generateCompetitorPost, generateCompetitorComment, generateNegativeBotComments } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import Modal from './components/Modal';
import GanttChart from './components/GanttChart';
import ManualSwotEditor from './components/ManualSwotEditor';
import MarketplaceModal from './components/MarketplaceModal';
import FinancialPlanTable from './components/FinancialPlanTable';
import ResearchModal from './components/ResearchModal';
import SocialMediaModal from './components/SocialMediaModal';
import ManagementModal from './components/ManagementModal';
import DiscountModal from './components/DiscountModal';
import CompetitorAnalysisGrid from './components/CompetitorAnalysisGrid';
import ManualCompetitorAnalysisEditor from './components/ManualCompetitorAnalysisEditor';


const WAREHOUSES_FOR_RENT: Warehouse[] = [
    { id: 'wh-small', name: 'Малий кошик', capacity: 150, dailyCost: 5 },
    { id: 'wh-medium', name: 'Склад "Комора"', capacity: 400, dailyCost: 25 },
    { id: 'wh-large', name: 'Логістичний хаб', capacity: 1000, dailyCost: 80 },
    { id: 'wh-xl', name: 'Мега-комплекс', capacity: 2500, dailyCost: 200 },
];

const EMPLOYEE_POOL: Employee[] = [
    { id: 'emp-1', name: 'Іван', skill: 'Виробництво', efficiencyBonus: 0.05, salary: 50, loyalty: 0.8, morale: 0.7 },
    { id: 'emp-2', name: 'Марія', skill: 'Маркетинг', efficiencyBonus: 0.10, salary: 70, loyalty: 0.7, morale: 0.8 },
    { id: 'emp-3', name: 'Петро', skill: 'Продажі', efficiencyBonus: 0.08, salary: 60, loyalty: 0.85, morale: 0.75 },
    { id: 'emp-4', name: 'Олена', skill: 'Виробництво', efficiencyBonus: 0.08, salary: 65, loyalty: 0.75, morale: 0.6 },
    { id: 'emp-5', name: 'Сергій', skill: 'Маркетинг', efficiencyBonus: 0.15, salary: 90, loyalty: 0.6, morale: 0.9 },
    { id: 'emp-6', name: 'Анна', skill: 'Дизайн', efficiencyBonus: 0.12, salary: 80, loyalty: 0.7, morale: 0.8 },
    { id: 'emp-7', name: 'Віктор', skill: 'Хімія', efficiencyBonus: 0.10, salary: 100, loyalty: 0.8, morale: 0.7 },
    { id: 'emp-8', name: 'Юлія', skill: 'Якість', efficiencyBonus: 0.09, salary: 75, loyalty: 0.85, morale: 0.85 },
    { id: 'emp-9', name: 'Ольга', skill: 'Косметолог', efficiencyBonus: 0.12, salary: 85, loyalty: 0.7, morale: 0.7 },
    { id: 'emp-10', name: 'Тарас', skill: 'Косметолог', efficiencyBonus: 0.09, salary: 75, loyalty: 0.8, morale: 0.65 },
];


const COMPANY_STRUCTURES: Record<CompanyStructureId, CompanyStructure> = {
    fair_stall: { id: 'fair_stall', name: 'Ярмарковий стенд', employeeLimit: 2, warehouseLimit: 1, upgradeCost: 5000, upgradeReq: { money: 5000 }, description: "Початковий етап. Малі обсяги, прямі продажі." },
    small_shop: { id: 'small_shop', name: 'Маленька крамниця', employeeLimit: 5, warehouseLimit: 2, upgradeCost: 25000, upgradeReq: { money: 25000, marketShare: 15 }, description: "Стабільний бізнес. Більше можливостей для росту." },
    llc: { id: 'llc', name: 'ТОВ "Цитрін"', employeeLimit: 10, warehouseLimit: 3, upgradeCost: 100000, upgradeReq: { money: 100000, marketShare: 30 }, description: "Товариство з обмеженою відповідальністю. Серйозний гравець на ринку." },
    pjsc: { id: 'pjsc', name: 'ПрАТ "Цитрін"', employeeLimit: 25, warehouseLimit: 5, upgradeCost: 0, upgradeReq: {}, description: "Приватне акціонерне товариство. Повний контроль над ринком." },
};


const RESEARCH_PROJECTS: ResearchProject[] = [
    { id: 'berry_mask', name: 'Ягідна косметика', description: 'Дослідити використання ягід для створення нової детокс-маски.', cost: 2000, duration: 5 }
];

const AD_CAMPAIGNS: Omit<AdCampaign, 'daysRemaining' | 'cost'>[] = [
    { type: 'social_media', name: "SMM-бліц", duration: 7, effectMultiplier: 1.2 },
    { type: 'billboards', name: "Білборди в місті", duration: 10, effectMultiplier: 1.5 },
    { type: 'radio', name: "Реклама на радіо", duration: 14, effectMultiplier: 1.8 },
];
const PLAYER_AD_CAMPAIGNS = AD_CAMPAIGNS.map(c => ({...c, cost: c.type === 'social_media' ? 800 : c.type === 'billboards' ? 2500 : 4000}));

const COMPETITOR_CAMPAIGNS: Omit<AdCampaign, 'daysRemaining'>[] = [
    ...PLAYER_AD_CAMPAIGNS,
    { type: 'smear', name: "Чорний PR", duration: 4, cost: 1500, effectMultiplier: 1.0 }, // Doesn't boost demand, just enables bot attacks
];


const initialGameState: GameState = {
  day: 1,
  player: {
    money: 1000,
    inventory: { lemons: 20, sugar: 15, bottles: 15, oil: 5, berries: 0, products: { cream: 0, tonic: 0, serum: 0, serum_deluxe: 0, berry_mask: 0 } },
    prices: { cream: 30, tonic: 20, serum: 40, serum_deluxe: 75, berry_mask: 55 },
    warehouses: [WAREHOUSES_FOR_RENT[0]],
    employees: [],
    companyStructure: 'fair_stall',
    unlockedProducts: ['cream', 'tonic', 'serum', 'serum_deluxe'],
    activeResearch: null,
    discounts: {},
    blockedUsers: [],
  },
  competitors: [
    { name: 'ZestyCo', icon: '🍊', prices: { cream: 28, tonic: 22, serum: 42, serum_deluxe: 78, berry_mask: 58 }, marketShare: 45, activeCampaign: null, unlockedProducts: ['cream', 'tonic', 'serum', 'serum_deluxe'], employees: [] },
    { name: 'FreshFace', icon: '✨', prices: { cream: 32, tonic: 18, serum: 38, serum_deluxe: 45, berry_mask: 53 }, marketShare: 35, activeCampaign: null, unlockedProducts: ['cream', 'tonic', 'serum', 'serum_deluxe'], employees: [] },
  ],
  log: [{ message: 'Вітаємо у "Цитрін"! Час починати.', type: 'info' }],
  market: { playerShare: 20, lastEvent: null, eventQueue: [], inflationRate: 0.001, currentIngredientPrices: { ...INGREDIENT_PRICES } },
  socialMedia: { posts: [], activeCampaign: null, pinnedPostId: null, boostedPosts: [] },
  availableEmployees: [...EMPLOYEE_POOL],
  orgChart: { id: 'root', name: 'Цитрін', employees: [], children: [] },
};

const marketEvents: MarketEvent[] = [
    { id: 'craze', message: "ТРЕНД! Лимонна косметика на піку популярності! Попит зростає.", type: 'positive', effect: { demandMultiplier: 1.5 } },
    { id: 'downturn', message: "КРИЗА! Покупці стали більш чутливими до цін.", type: 'negative', effect: { priceSensitivityMultiplier: 1.5 } },
    { id: 'serum_boom', message: "ВІДКРИТТЯ! Нове дослідження підтвердило ефективність сироваток. Попит на них злетів!", type: 'positive', effect: { productDemandMultiplier: { serum: 2.0, serum_deluxe: 2.2 } } },
    { id: 'tonic_trend', message: "МОДА! Блогери рекомендують тоніки для щоденного догляду. Попит збільшено.", type: 'positive', effect: { productDemandMultiplier: { tonic: 1.8 } } },
    { id: 'ingredient_surplus', message: "ДОБРІ НОВИНИ! Вдалий врожай лимонів, ціни на них тимчасово знижено!", type: 'positive', effect: {} },
    { id: 'competitor_scandal', message: "СКАНДАЛ! FreshFace звинувачують у використанні неякісних інгредієнтів!", type: 'positive', effect: {} },
    { id: 'luxury_demand', message: "РОЗКІШ! Багаті клієнти шукають ексклюзивні товари. Попит на люкс-сироватку зростає.", type: 'positive', effect: { productDemandMultiplier: { serum_deluxe: 2.5 } } },
    { id: 'tax_increase', message: "УВАГА! Уряд підвищив податки на косметичну продукцію! Витрати для всіх компаній зростають.", type: 'negative', effect: { costMultiplier: 1.2 } },
    { id: 'beauty_summit', message: "СВІТОВА ПОДІЯ! Міжнародний саміт краси визначив сироватки новим трендом року! Попит зростає глобально.", type: 'positive', effect: { productDemandMultiplier: { serum: 1.5, serum_deluxe: 1.8 } } },
    { id: 'hyperinflation', message: "ГІПЕРІНФЛЯЦІЯ! Економіка в колапсі! Ціни злетіли до небес, всі тепер мільйонери!", type: 'negative', effect: { inflationMultiplier: 1000 } },
    { id: 'stabilization', message: "СТАБІЛІЗАЦІЯ. Уряд вводить антиінфляційні заходи. Ринок поступово заспокоюється.", type: 'positive', effect: { stabilizationFactor: 0.5 } },
];

const calculateInventorySize = (inventory: Inventory): number => {
    const { products, ...ingredients } = inventory;
    const ingredientCount = Object.values(ingredients).reduce((sum, count) => sum + count, 0);
    const productCount = Object.values(products).reduce((sum, count) => sum + count, 0);
    return ingredientCount + productCount;
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);
    
    // --- Modals State ---
    const [isSwotModalOpen, setSwotModalOpen] = useState<boolean>(false);
    const [swotData, setSwotData] = useState<SWOTAnalysis | null>(null);
    const [isManualSwot, setIsManualSwot] = useState<boolean>(false);

    const [isPlanModalOpen, setPlanModalOpen] = useState<boolean>(false);
    const [editablePlan, setEditablePlan] = useState<BusinessPlan | null>(null);
    const [newTask, setNewTask] = useState<Omit<GanttTask, 'id' | 'isCompleted'>>({ name: '', startDay: 1, endDay: 10 });
    
    const [isCompAnalysisModalOpen, setCompAnalysisModalOpen] = useState<boolean>(false);
    const [compAnalysisData, setCompAnalysisData] = useState<CompetitorAnalysisData[] | null>(null);
    const [isManualCompAnalysis, setManualCompAnalysis] = useState<boolean>(false);

    const [isHistoryModalOpen, setHistoryModalOpen] = useState<boolean>(false);
    const [historyView, setHistoryView] = useState<'plan' | 'swot' | 'comp_analysis'>('plan');
    
    const [isMarketplaceOpen, setMarketplaceOpen] = useState<boolean>(false);
    const [isResearchModalOpen, setResearchModalOpen] = useState<boolean>(false);
    const [isSocialMediaModalOpen, setSocialMediaModalOpen] = useState<boolean>(false);
    const [isManagementModalOpen, setManagementModalOpen] = useState<boolean>(false);
    const [discountModalState, setDiscountModalState] = useState<{ isOpen: boolean; productId: ProductId | null }>({ isOpen: false, productId: null });


    // --- History State ---
    const [planHistory, setPlanHistory] = useState<BusinessPlanHistory>([]);
    const [swotHistory, setSwotHistory] = useState<SwotHistory>([]);
    const [compAnalysisHistory, setCompAnalysisHistory] = useState<CompAnalysisHistory>([]);

    // --- Memoized Values for Performance ---
    const { totalInventoryItems, warehouseCapacity } = useMemo(() => {
        const totalItems = calculateInventorySize(gameState.player.inventory);
        const capacity = gameState.player.warehouses.reduce((sum, wh) => sum + wh.capacity, 0);
        return { totalInventoryItems: totalItems, warehouseCapacity: capacity };
    }, [gameState.player.inventory, gameState.player.warehouses]);

    const companyStructureDetails = useMemo(() => {
        return COMPANY_STRUCTURES[gameState.player.companyStructure];
    }, [gameState.player.companyStructure]);


    useEffect(() => {
        if (gameState.player.money < 0 && !gameOver) {
            setGameOver(true);
        }
    }, [gameState.player.money, gameOver]);
    
    const restartGame = () => {
        setGameState(initialGameState);
        setPlanHistory([]);
        setSwotHistory([]);
        setGameOver(false);
    }

    const addToLog = (message: string, type: LogEntry['type']) => {
        setGameState(prev => ({
            ...prev,
            log: [...prev.log.slice(-9), { message: `Д.${prev.day}: ${message}`, type }]
        }));
    };

    const handleCraft = (productId: ProductId, quantity: number = 1): { success: boolean, logMessage: string, newInventory?: Inventory } => {
        const currentInventory = gameState.player.inventory;
        if (totalInventoryItems >= warehouseCapacity) {
          return { success: false, logMessage: "Недостатньо місця на складі!" };
        }
       
        const { ingredients } = PRODUCT_DETAILS[productId];
        const canCraft = Object.entries(ingredients).every(([key, val]) => val !== undefined && currentInventory[key as keyof Omit<Inventory, 'products'>] >= val * quantity);
        
        if (canCraft) {
            const newInventory = { ...currentInventory };
            Object.entries(ingredients).forEach(([key, val]) => {
                if (val !== undefined) {
                  newInventory[key as keyof Omit<Inventory, 'products'>] -= val * quantity;
                }
            });
            newInventory.products[productId] += quantity;
            return { success: true, logMessage: `Виготовлено ${quantity} ${PRODUCT_DETAILS[productId].shortName}!`, newInventory };
        }
        return { success: false, logMessage: "Недостатньо інгредієнтів!" };
    };

     const executeCraft = (productId: ProductId) => {
        const result = handleCraft(productId);
        addToLog(result.logMessage, result.success ? 'info' : 'danger');
        if (result.success && result.newInventory) {
            setGameState(prev => ({ ...prev, player: { ...prev.player, inventory: result.newInventory }}));
        }
    }


    const handlePriceChange = (productId: ProductId, amount: number) => {
        setGameState(prev => ({ ...prev, player: { ...prev.player, prices: {
            ...prev.player.prices,
            [productId]: Math.max(1, prev.player.prices[productId] + amount)
        } } }));
    };

    const handleBuyIngredients = (ingredient: keyof typeof INGREDIENT_PRICES, quantity: number) => {
      if (totalInventoryItems + quantity > warehouseCapacity) {
        addToLog("Недостатньо місця на складі!", 'danger');
        return;
      }
      setGameState(prev => {
        let currentPrice = prev.market.currentIngredientPrices[ingredient];
        if (prev.market.lastEvent?.id === 'ingredient_surplus' && ingredient === 'lemons') {
          currentPrice *= 0.5; // Apply discount
        }
        const cost = currentPrice * quantity;

        if (prev.player.money < cost) {
          addToLog("Недостатньо грошей для закупівлі!", 'danger');
          return prev;
        }
        const newInventory = {...prev.player.inventory};
        newInventory[ingredient] += quantity;
        const newMoney = prev.player.money - cost;
        const newLog = [...prev.log.slice(-9), { message: `Д.${prev.day}: Закуплено ${ingredient} x${quantity} за $${cost.toFixed(2)}.`, type: 'info' as const }];
        return {...prev, player: {...prev.player, money: newMoney, inventory: newInventory}, log: newLog };
      });
    }

    const handleRentWarehouse = (warehouse: Warehouse) => {
        if (gameState.player.warehouses.length >= companyStructureDetails.warehouseLimit) {
            addToLog(`Ліміт складів для "${companyStructureDetails.name}" досягнуто!`, 'danger');
            return;
        }
        setGameState(prev => ({
            ...prev,
            player: { ...prev.player, warehouses: [...prev.player.warehouses, warehouse] }
        }));
        addToLog(`Орендовано новий склад: "${warehouse.name}".`, 'info');
    }

    const handleHireEmployee = (employee: Employee, source: 'pool' | 'competitor', competitorName?: string) => {
        const hiringFee = source === 'competitor' ? employee.salary * 15 : employee.salary * 5;

        if (gameState.player.money < hiringFee) {
            addToLog("Недостатньо грошей для найму!", 'danger');
            return;
        }

        if (gameState.player.employees.length >= companyStructureDetails.employeeLimit) {
            addToLog(`Ліміт співробітників для "${companyStructureDetails.name}" досягнуто!`, 'danger');
            return;
        }
        
        setGameState(prev => {
            const newState = {...prev};
            newState.player.money -= hiringFee;
            newState.player.employees.push({...employee, morale: 0.7}); // Add employee with default morale

            if (source === 'pool') {
                newState.availableEmployees = newState.availableEmployees.filter(e => e.id !== employee.id);
            } else if (source === 'competitor' && competitorName) {
                const compIndex = newState.competitors.findIndex(c => c.name === competitorName);
                if (compIndex > -1) {
                    newState.competitors[compIndex].employees = newState.competitors[compIndex].employees.filter(e => e.id !== employee.id);
                }
            }
            return newState;
        });
        
        const message = source === 'pool' 
            ? `НАЙНЯТО! ${employee.name} приєднується до команди! Вартість: $${hiringFee}.` 
            : `ПЕРЕМАНЕНО! ${employee.name} перейшов з ${competitorName}! Вартість: $${hiringFee}.`;
        addToLog(message, 'success');
    }

    const handleFireEmployee = (employeeId: string) => {
        const employeeName = gameState.player.employees.find(e => e.id === employeeId)!.name;
        setGameState(prev => ({
            ...prev,
            player: { ...prev.player, employees: prev.player.employees.filter(e => e.id !== employeeId) },
            availableEmployees: [...prev.availableEmployees, prev.player.employees.find(e => e.id === employeeId)!],
        }));
        addToLog(`Співробітника ${employeeName} звільнено.`, 'info');
    }

    const handleUpgradeStructure = (structure: CompanyStructure) => {
        if (gameState.player.money < structure.upgradeCost) {
            addToLog(`Недостатньо грошей для реструктуризації! Потрібно $${structure.upgradeCost}.`, 'danger');
            return;
        }
        if (gameState.market.playerShare < (structure.upgradeReq.marketShare ?? 0)) {
             addToLog(`Ваша частка ринку занадто мала! Потрібно ${structure.upgradeReq.marketShare}%.`, 'danger');
            return;
        }

        setGameState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                money: prev.player.money - structure.upgradeCost,
                companyStructure: structure.id,
            }
        }));
        addToLog(`БІЗНЕС ВИРІС! Ваша компанія тепер — "${structure.name}"!`, 'success');
    }
    
    const handleUpdateOrgChart = (newChart: OrgChartNode) => {
        setGameState(prev => ({...prev, orgChart: newChart}));
    }


    const handleStartResearch = (project: ResearchProject) => {
        if (gameState.player.money < project.cost) {
            addToLog("Недостатньо грошей для дослідження!", 'danger');
            return;
        }
        if (gameState.player.activeResearch) {
            addToLog("Дослідження вже триває!", 'info');
            return;
        }
        setGameState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                money: prev.player.money - project.cost,
                activeResearch: { projectId: project.id, daysRemaining: project.duration },
            }
        }));
        addToLog(`Почато дослідження '${project.name}'! Вартість: $${project.cost}.`, 'info');
        setResearchModalOpen(false);
    };

    const handlePostToSocialMedia = async (postContent: string) => {
        if (!postContent.trim()) return;
        addToLog("Публікуємо допис у соцмережі...", 'info');
        setIsLoading(true);
        try {
            const comments = await generateSocialMediaComments(postContent);
            const newPost: SocialMediaPost = {
                id: `post-player-${Date.now()}`,
                day: gameState.day,
                author: 'Цитрін',
                authorIcon: '🍋',
                content: postContent,
                comments,
            };
            setGameState(prev => ({
                ...prev,
                socialMedia: {
                    ...prev.socialMedia,
                    posts: [newPost, ...prev.socialMedia.posts],
                }
            }));
            addToLog("Допис опубліковано! З'явились перші коментарі.", 'success');
        } catch (error) {
            console.error("Failed to generate comments:", error);
            addToLog("Помилка під час публікації допису.", 'danger');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReplyToComment = (postId: string, commentIndex: number, replyText: string) => {
        setGameState(prev => {
            const newPosts = [...prev.socialMedia.posts];
            const postIndex = newPosts.findIndex(p => p.id === postId);
            if (postIndex === -1) return prev;

            const post = { ...newPosts[postIndex] };
            const comment = { ...post.comments[commentIndex] };
            if (!comment.replies) {
                comment.replies = [];
            }
            comment.replies.push({ author: 'Цитрін', text: replyText });

            post.comments[commentIndex] = comment;
            newPosts[postIndex] = post;

            return {
                ...prev,
                socialMedia: {
                    ...prev.socialMedia,
                    posts: newPosts,
                }
            };
        });
    };

    const handleDeletePost = (postId: string) => {
        setGameState(prev => {
            const newPosts = prev.socialMedia.posts.filter(p => p.id !== postId);
            let newPinnedId = prev.socialMedia.pinnedPostId;
            if (newPinnedId === postId) {
                newPinnedId = null;
            }
            return {
                ...prev,
                socialMedia: {
                    ...prev.socialMedia,
                    posts: newPosts,
                    pinnedPostId: newPinnedId
                }
            };
        });
        addToLog("Ваш допис було видалено.", 'info');
    };

    const handleBlockUser = (author: string) => {
        setGameState(prev => {
            if (prev.player.blockedUsers.includes(author)) return prev;
            return {
                ...prev,
                player: {
                    ...prev.player,
                    blockedUsers: [...prev.player.blockedUsers, author]
                }
            };
        });
        addToLog(`Користувача ${author} було заблоковано.`, 'info');
    };

    const handlePinPost = (postId: string) => {
        setGameState(prev => ({
            ...prev,
            socialMedia: {
                ...prev.socialMedia,
                pinnedPostId: prev.socialMedia.pinnedPostId === postId ? null : postId
            }
        }));
        const isPinning = gameState.socialMedia.pinnedPostId !== postId;
        addToLog(isPinning ? "Допис закріплено." : "Допис відкріплено.", 'info');
    };

    const handleBoostPost = (postId: string) => {
        const BOOST_COST = 250;
        const BOOST_DURATION = 3;
        if (gameState.player.money < BOOST_COST) {
            addToLog("Недостатньо грошей для просування допису!", 'danger');
            return;
        }
        setGameState(prev => {
            if (prev.socialMedia.boostedPosts.some(p => p.postId === postId)) return prev; // Already boosted
            return {
                ...prev,
                player: { ...prev.player, money: prev.player.money - BOOST_COST },
                socialMedia: {
                    ...prev.socialMedia,
                    boostedPosts: [...prev.socialMedia.boostedPosts, { postId, daysRemaining: BOOST_DURATION }]
                }
            }
        });
        addToLog(`Допис просувається! Очікуйте підвищеного попиту.`, 'success');
    };


    const handleLaunchAdCampaign = (campaign: Omit<AdCampaign, 'daysRemaining'>) => {
        if (gameState.player.money < campaign.cost) {
            addToLog("Недостатньо грошей для запуску кампанії!", 'danger');
            return;
        }
        if (gameState.socialMedia.activeCampaign) {
            addToLog("Рекламна кампанія вже активна!", 'info');
            return;
        }
        setGameState(prev => ({
            ...prev,
            player: { ...prev.player, money: prev.player.money - campaign.cost },
            socialMedia: {
                ...prev.socialMedia,
                activeCampaign: { ...campaign, daysRemaining: campaign.duration },
            }
        }));
        addToLog(`Запущено рекламну кампанію "${campaign.name}"!`, 'success');
        setSocialMediaModalOpen(false);
    };

    const handleSetDiscount = (productId: ProductId, percentage: number, duration: number, cost: number) => {
        if (gameState.player.money < cost) {
            addToLog("Недостатньо грошей для запуску акції!", 'danger');
            return;
        }
        setGameState(prev => {
            const newDiscounts = { ...prev.player.discounts };
            newDiscounts[productId] = { percentage, daysRemaining: duration };
            return {
                ...prev,
                player: {
                    ...prev.player,
                    money: prev.player.money - cost,
                    discounts: newDiscounts,
                }
            }
        });
        addToLog(`Розпочато розпродаж ${PRODUCT_DETAILS[productId].shortName} зі знижкою ${percentage * 100}%!`, 'success');
        setDiscountModalState({ isOpen: false, productId: null });
    };

    const handleNextDay = async () => {
        setIsLoading(true);

        let newState = JSON.parse(JSON.stringify(gameState)) as GameState;
        newState.day++;
        const logCollector: { message: string, type: LogEntry['type'] }[] = [];
        const addLog = (msg: string, type: LogEntry['type']) => logCollector.push({ message: msg, type });

        // 0. Market Event Simulation & Inflation
        let event = null;
        if (Math.random() < 0.01 && newState.day > 50) { // Hyperinflation is rare
            event = marketEvents.find(e => e.id === 'hyperinflation')!;
        } else if (Math.random() < 0.05 && newState.market.inflationRate > 0.005) {
             event = marketEvents.find(e => e.id === 'stabilization')!;
        } else if (Math.random() < 0.15) { // Regular random event
            event = marketEvents[Math.floor(Math.random() * marketEvents.length)];
             if (event.id === 'hyperinflation') event = null; // Don't trigger hyperinflation randomly
        }
        
        if (event) addLog(`ПОДІЯ: ${event.message}`, 'event');
        newState.market.lastEvent = event;

        if (event?.effect.inflationMultiplier) {
            const multiplier = event.effect.inflationMultiplier;
            newState.player.money *= multiplier;
            Object.keys(newState.player.prices).forEach(k => newState.player.prices[k as ProductId] *= multiplier);
            Object.keys(newState.market.currentIngredientPrices).forEach(k => newState.market.currentIngredientPrices[k as keyof typeof INGREDIENT_PRICES] *= multiplier);
            newState.competitors.forEach(c => Object.keys(c.prices).forEach(k => c.prices[k as ProductId] *= multiplier));
            newState.player.employees.forEach(e => e.salary *= multiplier);
        }
        if (event?.effect.stabilizationFactor) {
            newState.market.inflationRate *= event.effect.stabilizationFactor;
            addLog(`Рівень інфляції стабілізується.`, 'info');
        }

        const inflation = newState.market.inflationRate;
        const newIngredientPrices = { ...newState.market.currentIngredientPrices };
        for (const key in newIngredientPrices) {
            newIngredientPrices[key as keyof typeof newIngredientPrices] *= (1 + inflation);
        }
        newState.market.currentIngredientPrices = newIngredientPrices;

        const inflateProductPrices = (prices: Record<ProductId, number>): Record<ProductId, number> => {
            const newPrices = { ...prices };
            for (const key in newPrices) {
                newPrices[key as ProductId] *= (1 + inflation);
            }
            return newPrices;
        };

        newState.player.prices = inflateProductPrices(newState.player.prices);
        newState.competitors.forEach(competitor => {
            competitor.prices = inflateProductPrices(competitor.prices);
        });

        if (newState.day > 1 && newState.day % 15 === 0) {
             addLog(`РИНОК: Інфляція поступово підвищує ціни на все.`, 'info');
        }

        // 1. Process Research, Ad Campaign, Discounts, Boosts
        if (newState.player.activeResearch) {
            newState.player.activeResearch.daysRemaining--;
            if (newState.player.activeResearch.daysRemaining <= 0) {
                const project = RESEARCH_PROJECTS.find(p => p.id === newState.player.activeResearch!.projectId)!;
                newState.player.unlockedProducts.push(project.id);
                newState.player.activeResearch = null;
                addLog(`ДОСЛІДЖЕННЯ ЗАВЕРШЕНО! Відкрито рецепт '${PRODUCT_DETAILS[project.id].name}'.`, 'success');
            }
        }
        if (newState.socialMedia.activeCampaign) {
            newState.socialMedia.activeCampaign.daysRemaining--;
            if (newState.socialMedia.activeCampaign.daysRemaining <= 0) {
                addLog(`Рекламна кампанія "${newState.socialMedia.activeCampaign.name}" завершилась.`, 'info');
                newState.socialMedia.activeCampaign = null;
            }
        }
        if (newState.socialMedia.boostedPosts.length > 0) {
            newState.socialMedia.boostedPosts = newState.socialMedia.boostedPosts
                .map(p => ({ ...p, daysRemaining: p.daysRemaining - 1 }))
                .filter(p => p.daysRemaining > 0);
        }
        const newDiscounts = { ...newState.player.discounts };
        for (const key in newDiscounts) {
            const productId = key as ProductId;
            const discount = newDiscounts[productId];
            if (discount) {
                discount.daysRemaining--;
                if (discount.daysRemaining <= 0) {
                    delete newDiscounts[productId];
                    addLog(`Знижка на ${PRODUCT_DETAILS[productId].shortName} закінчилася.`, 'info');
                }
            }
        }
        newState.player.discounts = newDiscounts;
        
        const costMultiplier = event?.effect.costMultiplier ?? 1;

        // 2. Daily Costs (Warehouses, Salaries)
        const totalWarehouseCost = newState.player.warehouses.reduce((sum, wh) => sum + wh.dailyCost, 0) * costMultiplier;
        const totalSalaryCost = newState.player.employees.reduce((sum, emp) => sum + emp.salary, 0) * costMultiplier;
        newState.player.money -= totalWarehouseCost;
        newState.player.money -= totalSalaryCost;
        if (totalWarehouseCost > 0) addLog(`Оренда складів: $${totalWarehouseCost.toFixed(2)}.`, 'danger');
        if (totalSalaryCost > 0) addLog(`Зарплати співробітникам: $${totalSalaryCost.toFixed(2)}.`, 'danger');
        
        // 3. Employee Automation & Events
        for (const emp of newState.player.employees) {
            emp.morale += (0.5 - emp.morale) * 0.05; // Morale trends towards 0.5
            
            // Automation
            if (Math.random() < emp.morale * 0.6) { // Increased chance for autonomous action
                switch(emp.skill) {
                    case 'Виробництво':
                    case 'Хімія':
                        const lowStockProduct = newState.player.unlockedProducts.find(pId => newState.player.inventory.products[pId] < 5);
                        if(lowStockProduct) {
                            const result = handleCraft(lowStockProduct);
                            if (result.success && result.newInventory) {
                                newState.player.inventory = result.newInventory;
                                addLog(`АВТОМАТИЗАЦІЯ: ${emp.name} виготовив ${PRODUCT_DETAILS[lowStockProduct].shortName}, бачачи низькі запаси.`, 'info');
                            }
                        }
                        break;
                    case 'Продажі':
                        const productToAdjust = newState.player.unlockedProducts[Math.floor(Math.random() * newState.player.unlockedProducts.length)];
                        const playerPrice = newState.player.prices[productToAdjust];
                        const avgCompPrice = newState.competitors.reduce((sum, c) => sum + c.prices[productToAdjust], 0) / newState.competitors.length;
                        if (playerPrice > avgCompPrice * 1.2) {
                            newState.player.prices[productToAdjust] = Math.max(1, playerPrice - 1);
                             addLog(`АВТОМАТИЗАЦІЯ: ${emp.name} знизив ціну на ${PRODUCT_DETAILS[productToAdjust].shortName} для конкурентоспроможності.`, 'info');
                        }
                        break;
                    case 'Маркетинг':
                        const postToCommentOn = newState.socialMedia.posts.find(p => p.author === 'Цитрін' && p.comments.some(c => c.sentiment !== 'positive' && !c.replies?.some(r => r.author.includes('Цитрін'))));
                        if(postToCommentOn) {
                             const commentIndex = postToCommentOn.comments.findIndex(c => c.sentiment !== 'positive' && !c.replies?.some(r => r.author.includes('Цитрін')));
                             if (commentIndex !== -1) {
                                const newReply = { author: `${emp.name} (SMM 'Цитрін')`, text: "Дякуємо за ваш відгук! Ми працюємо над цим."};
                                if(!postToCommentOn.comments[commentIndex].replies) postToCommentOn.comments[commentIndex].replies = [];
                                postToCommentOn.comments[commentIndex].replies!.push(newReply);
                                addLog(`АВТОМАТИЗАЦІЯ: ${emp.name} відповів на коментар у соцмережах.`, 'info');
                             }
                        } else if (Math.random() < 0.2) { // Chance to create a positive post
                            const newPostContent = `Наші клієнти люблять ${PRODUCT_DETAILS.cream.shortName}! ✨ #цитрін #догляд`;
                            const newPost: SocialMediaPost = { id: `post-emp-${emp.id}-${Date.now()}`, day: newState.day, author: `${emp.name} (SMM 'Цитрін')`, authorIcon: '🍋', content: newPostContent, comments: [] };
                            newState.socialMedia.posts.unshift(newPost);
                            addLog(`SMM: ${emp.name} опублікував позитивний пост.`, 'success');
                        }
                        break;
                }
            }

            // Random Events (Positive/Negative)
            const eventChance = 0.1; // 10% chance for an event per employee
            if (Math.random() < eventChance) {
                const isPositive = Math.random() < emp.morale; // Higher morale = higher chance of positive event
                emp.morale += isPositive ? 0.1 : -0.1; // Event outcome affects morale
                emp.morale = Math.max(0, Math.min(1, emp.morale));

                if (isPositive) {
                     switch(emp.skill) {
                        case 'Виробництво':
                            const randomProd = newState.player.unlockedProducts[Math.floor(Math.random() * newState.player.unlockedProducts.length)];
                            const craftResult = handleCraft(randomProd);
                            if(craftResult.success && craftResult.newInventory) {
                                newState.player.inventory = craftResult.newInventory;
                                addLog(`УСПІХ! ${emp.name} розробив ефективніший метод виробництва і створив додатковий ${PRODUCT_DETAILS[randomProd].shortName}!`, 'success');
                            }
                            break;
                        case 'Маркетинг':
                            const positivePost: SocialMediaPost = { id: `post-event-${Date.now()}`, day: newState.day, author: `${emp.name} (SMM 'Цитрін')`, authorIcon: '🍋', content: "Наші клієнти - найкращі! Дякуємо, що ви з нами! ❤️", comments: [] };
                            newState.socialMedia.posts.unshift(positivePost);
                             addLog(`КРЕАТИВ! ${emp.name} запустив хвилю позитиву в соцмережах!`, 'success');
                            break;
                        case 'Продажі':
                            const bonusMoney = Math.floor(Math.random() * 500 + 100);
                            newState.player.money += bonusMoney;
                            addLog(`ВИГОДА! ${emp.name} уклав вигідну угоду і заробив для компанії $${bonusMoney}!`, 'success');
                            break;
                        case 'Хімія':
                             addLog(`ІННОВАЦІЯ! Хімік ${emp.name} знайшов спосіб зекономити інгредієнти на наступні 5 крафтів!`, 'success');
                             break;
                        case 'Дизайн':
                             addLog(`ДИЗАЙН! ${emp.name} створив нове пакування, яке викликало ажіотаж! Попит тимчасово зріс.`, 'success');
                             break;
                        case 'Якість':
                             addLog(`ЯКІСТЬ! ${emp.name} вчасно виявив проблему на виробництві, врятувавши репутацію!`, 'success');
                             break;
                        case 'Косметолог':
                             addLog(`ЕКСПЕРТИЗА! ${emp.name} написав статтю, яка підвищила довіру до бренду!`, 'success');
                             break;
                    }
                } else { // Negative events
                    switch(emp.skill) {
                        case 'Виробництво':
                             const spoiledIngredient = (['lemons', 'sugar', 'bottles'] as const)[Math.floor(Math.random()*3)];
                             const amountSpoiled = Math.min(newState.player.inventory[spoiledIngredient], 5);
                             if (amountSpoiled > 0) {
                                newState.player.inventory[spoiledIngredient] -= amountSpoiled;
                                addLog(`НЕУВАЖНІСТЬ! ${emp.name} зіпсував ${amountSpoiled} одиниць інгредієнта '${spoiledIngredient}'!`, 'danger');
                             }
                            break;
                        case 'Маркетинг':
                            const negativePost: SocialMediaPost = { id: `post-event-${Date.now()}`, day: newState.day, author: `${emp.name} (SMM 'Цитрін')`, authorIcon: '🍋', content: "Ой, здається, я опублікував щось не те... 😟", comments: [] };
                            newState.socialMedia.posts.unshift(negativePost);
                            addLog(`ПОМИЛКА! ${emp.name} випадково опублікував дивний пост, спантеличивши клієнтів.`, 'danger');
                            break;
                        case 'Продажі':
                            const lostMoney = Math.floor(Math.random() * 200 + 50);
                            newState.player.money -= lostMoney;
                            addLog(`ВТРАТИ! Через помилку ${emp.name} в розрахунках, компанія втратила $${lostMoney}.`, 'danger');
                            break;
                        default:
                            addLog(`ПРОБЛЕМА! ${emp.name} (${emp.skill}) мав поганий день, що негативно вплинуло на робочий процес.`, 'danger');
                            break;
                    }
                }
            }
        }
        
        // 5. Sales Simulation
        let marketingBonus = 1 + newState.player.employees.filter(e => e.skill === 'Маркетинг' || e.skill === 'Дизайн').reduce((sum, e) => sum + e.efficiencyBonus, 0);
        let boostBonus = 1 + newState.socialMedia.boostedPosts.length * 0.1; // 10% bonus per boosted post
        let demandMultiplier = (event?.effect.demandMultiplier ?? 1) * marketingBonus * boostBonus;
        if (newState.socialMedia.activeCampaign) demandMultiplier *= newState.socialMedia.activeCampaign.effectMultiplier;

        let totalRevenue = 0;
        const sales: Record<string, number> = { player: 0, ZestyCo: 0, FreshFace: 0 };
        const allProductIds = Object.keys(PRODUCT_DETAILS) as ProductId[];
        const BASE_DEMAND: Record<ProductId, number> = { cream: 10, tonic: 12, serum: 8, serum_deluxe: 5, berry_mask: 7 };
        
        allProductIds.forEach(id => {
            const playerDiscount = newState.player.discounts[id];
            const playerPrice = playerDiscount ? newState.player.prices[id] * (1 - playerDiscount.percentage) : newState.player.prices[id];
            
            const sellers = [
                { name: 'player', price: playerPrice, unlocked: newState.player.unlockedProducts.includes(id) },
                ...newState.competitors.map(c => ({ name: c.name, price: c.prices[id], unlocked: c.unlockedProducts.includes(id) }))
            ].filter(s => s.unlocked);

            if (sellers.length === 0) return;

            const avgPrice = sellers.reduce((sum, s) => sum + s.price, 0) / sellers.length;
            
            const attractiveness = sellers.map(seller => {
                let attr = Math.max(0.1, 1 + (avgPrice - seller.price) / avgPrice);
                if (seller.name === 'player' && playerDiscount) attr *= 1.5; // Discount attractiveness boost
                return attr;
            });

            const totalAttractiveness = attractiveness.reduce((sum, a) => sum + a, 0);
            const totalDemandForProduct = BASE_DEMAND[id] * demandMultiplier * (event?.effect.productDemandMultiplier?.[id] ?? 1);

            sellers.forEach((seller, index) => {
                const sellerDemand = Math.round((attractiveness[index] / totalAttractiveness) * totalDemandForProduct);
                if (seller.name === 'player') {
                    let salesBonus = 1 + newState.player.employees.filter(e => e.skill === 'Продажі' || e.skill === 'Косметолог').reduce((sum, e) => sum + e.efficiencyBonus, 0);
                    const demandWithBonus = Math.round(sellerDemand * salesBonus);
                    const playerSales = Math.min(newState.player.inventory.products[id], demandWithBonus);
                    if (playerSales > 0) {
                        totalRevenue += playerSales * seller.price; // Use discounted price for revenue
                        newState.player.inventory.products[id] -= playerSales;
                        sales.player += playerSales;
                    }
                } else {
                    sales[seller.name] += sellerDemand;
                }
            });
        });
        if (totalRevenue > 0) {
            addLog(`Загальний дохід: $${totalRevenue.toFixed(2)}.`, 'success');
            if (totalRevenue > 100) newState.player.employees.forEach(e => e.morale = Math.min(1, e.morale + 0.05));
        }
        newState.player.money += totalRevenue;
        
        // 6. Update Market Shares & Competitor AI
        const totalMarketSales = sales.player + sales.ZestyCo + sales.FreshFace;
        const playerMarketShare = totalMarketSales > 0 ? Math.round((sales.player / totalMarketSales) * 100) : newState.market.playerShare;
        newState.market.playerShare = playerMarketShare;

        const newCompetitors = [];
        for (const c of newState.competitors) {
            let competitor = JSON.parse(JSON.stringify(c));
            competitor.marketShare = totalMarketSales > 0 ? Math.round((sales[c.name] / totalMarketSales) * 100) : c.marketShare;
            
            // ... (existing competitor hiring/poaching logic)

             // Competitor SMM actions
            if (Math.random() < 0.2) { // General chance for any SMM action
                 const actionRoll = Math.random();
                 if (actionRoll < 0.4) { // Post (regular or attack)
                     const otherCompetitors = newState.competitors.filter(oc => oc.name !== competitor.name);
                     const targets = ['Цитрін', ...otherCompetitors.map(oc => oc.name)];
                     const target = Math.random() < 0.3 // 30% chance to attack
                        ? targets[Math.floor(Math.random() * targets.length)]
                        : undefined;
                     try {
                        const postContent = await generateCompetitorPost(competitor.name, newState, target);
                        if (postContent) {
                            const newPost: SocialMediaPost = { id: `post-comp-${competitor.name}-${Date.now()}`, day: newState.day, author: competitor.name, authorIcon: competitor.icon, content: postContent, comments: [] };
                            newState.socialMedia.posts.unshift(newPost);
                            addLog(`SMM: ${competitor.name} опублікував новий пост ${target ? `(атака на ${target})` : ''}.`, 'info');
                        }
                    } catch (e) { console.error("Competitor post generation failed:", e); }
                 } else if (actionRoll < 0.7 && newState.socialMedia.posts.length > 0) { // Comment on player
                    const playerPost = newState.socialMedia.posts.find(p => p.author === 'Цитрін');
                    if (playerPost) {
                         try {
                            const { text } = await generateCompetitorComment(competitor.name, playerPost.content);
                            playerPost.comments.push({ author: competitor.name, text, sentiment: 'negative' });
                            addLog(`АТАКА! ${competitor.name} залишив провокаційний коментар!`, 'danger');
                        } catch (e) { console.error("Competitor comment generation failed:", e); }
                    }
                 } else { // Launch smear campaign
                     if (!competitor.activeCampaign) {
                         const smearCampaign = COMPETITOR_CAMPAIGNS.find(c => c.type === 'smear')!;
                         competitor.activeCampaign = { ...smearCampaign, daysRemaining: smearCampaign.duration };
                         addLog(`SMM ВІЙНА! ${competitor.name} розпочав кампанію "Чорний PR"!`, 'event');
                     }
                 }
            }

            if (competitor.activeCampaign?.type === 'smear') {
                const playerPost = newState.socialMedia.posts.find(p => p.author === 'Цитрін' || p.author.includes('Цитрін'));
                if (playerPost) {
                     try {
                        const botComments = await generateNegativeBotComments(competitor.name, 3);
                        playerPost.comments.push(...botComments.map(c => ({...c, isBot: true})));
                        addLog(`АТАКА БОТІВ! ${competitor.name} атакує ваш останній допис!`, 'danger');
                    } catch (e) { console.error("Bot comment generation failed:", e); }
                }
            }


            newCompetitors.push(competitor);
        }
        newState.competitors = newCompetitors;
        newState.socialMedia.posts.sort((a,b) => b.day - a.day);


        const finalLog = [...gameState.log, ...logCollector.map(item => ({...item, message: `Д.${newState.day}: ${item.message}`}))].slice(-10);
        newState.log = finalLog;
        
        setGameState(newState);
        setIsLoading(false);
    };

    const handleSaveSwot = () => { if (swotData) setSwotHistory(prev => [...prev, { day: gameState.day, data: swotData }]); };
    const handleSavePlan = () => { if (editablePlan) setPlanHistory(prev => [...prev, { day: gameState.day, data: editablePlan }]); };
    const handleGenerateSwotAI = async () => { setIsLoading(true); try { const data = await generateDynamicSwot(gameState); setSwotData(data); setIsManualSwot(false); } catch (e) { console.error(e); } finally { setIsLoading(false); } };
    const handleCreateManualSwot = () => { setSwotData({ strengths: ["..."], weaknesses: ["..."], opportunities: ["..."], threats: ["..."] }); setIsManualSwot(true); };
    
    const handleGenerateCompAnalysis = async () => {
        setIsLoading(true);
        setCompAnalysisData(null);
        try {
            const data = await generateCompetitorAnalysisGrid(gameState);
            setCompAnalysisData(data);
            setManualCompAnalysis(false);
        } catch (e) {
            console.error(e);
            addToLog("Помилка аналізу ринку.", 'danger');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreateManualCompAnalysis = () => {
        setCompAnalysisData([
            { companyName: 'Цитрін', location: '', contactInfo: '', links: '', employees: '', annualSales: '', revenue: '', businessValue: '', stockValue: '' },
            { companyName: 'Конкурент А', location: '', contactInfo: '', links: '', employees: '', annualSales: '', revenue: '', businessValue: '', stockValue: '' }
        ]);
        setManualCompAnalysis(true);
    };
    
    const handleSaveCompAnalysis = () => { if (compAnalysisData) setCompAnalysisHistory(prev => [...prev, { day: gameState.day, data: compAnalysisData }]); };


    const handleGeneratePlanAI = async () => { setIsLoading(true); try { const data = await generateBusinessPlan(gameState); const planWithCompletion = { ...data, ganttTasks: data.ganttTasks.map(t => ({...t, isCompleted: false})) }; setEditablePlan(JSON.parse(JSON.stringify(planWithCompletion))); } catch (e) { console.error(e); } finally { setIsLoading(false); } };
    const handleCreateManualPlan = () => { setEditablePlan({ goals: ["..."], financialProjections: [{id: `proj-${Date.now()}`, period: 'Квартал 1', capital: gameState.player.money, income: 0, expenses: 0, additionalExpenses: 0, netIncome: 0}], ganttTasks: [{id: `task-${Date.now()}`, name: "...", startDay: 1, endDay: 30, isCompleted: false}] }); };
    
    const handlePlanGoalChange = (index: number, value: string) => { if (!editablePlan) return; const newGoals = [...editablePlan.goals]; newGoals[index] = value; setEditablePlan({ ...editablePlan, goals: newGoals }); };
    const handleAddPlanGoal = () => { if (!editablePlan) return; setEditablePlan({ ...editablePlan, goals: [...editablePlan.goals, "Нова ціль..."] }); };
    const handleUpdateFinancialRow = (rowId: string, field: keyof Omit<FinancialProjectionRow, 'id' | 'netIncome'>, value: string | number) => { if (!editablePlan) return; setEditablePlan(prev => prev ? ({ ...prev, financialProjections: prev.financialProjections.map(r => r.id === rowId ? {...r, [field]: value} : r) }) : null); };
    const handleAddFinancialRow = () => { if (!editablePlan) return; const newRow: FinancialProjectionRow = { id: `proj-${Date.now()}`, period: 'Новий період', capital: 0, income: 0, expenses: 0, additionalExpenses: 0, netIncome: 0 }; setEditablePlan(prev => prev ? ({ ...prev, financialProjections: [...prev.financialProjections, newRow] }) : null); };
    const handleRemoveFinancialRow = (rowId: string) => { if (!editablePlan) return; setEditablePlan(prev => prev ? ({...prev, financialProjections: prev.financialProjections.filter(r => r.id !== rowId) }) : null); };
    const handleGanttTaskUpdate = (taskId: string, newName: string) => { if (!editablePlan) return; setEditablePlan(prev => prev ? ({ ...prev, ganttTasks: prev.ganttTasks.map(t => t.id === taskId ? { ...t, name: newName } : t) }) : null); };
    const handleGanttTaskRemove = (taskId: string) => { if (!editablePlan) return; setEditablePlan(prev => prev ? ({ ...prev, ganttTasks: prev.ganttTasks.filter(t => t.id !== taskId) }) : null); };
    const handleToggleGanttTaskCompletion = (taskId: string) => { if (!editablePlan) return; setEditablePlan(prev => prev ? ({...prev, ganttTasks: prev.ganttTasks.map(t => t.id === taskId ? {...t, isCompleted: !t.isCompleted } : t)}) : null); };
    const handleAddNewGanttTask = () => { if (!editablePlan || !newTask.name) return; const newGanttTask: GanttTask = { ...newTask, id: `task-${Date.now()}`, isCompleted: false}; setEditablePlan(prev => prev ? ({ ...prev, ganttTasks: [...prev.ganttTasks, newGanttTask] }) : null); setNewTask({ name: '', startDay: 1, endDay: 10 }); };
    
    const ingredientTranslations: Record<string, string> = {
        lemons: "Лимони",
        sugar: "Цукор",
        bottles: "Пляшки",
        oil: "Ефірна олія",
        berries: "Ягоди"
    };

    const getIngredientTooltip = (productId: ProductId): string => {
        const { ingredients } = PRODUCT_DETAILS[productId];
        return Object.entries(ingredients)
            .map(([key, value]) => `${ingredientTranslations[key] || key}: ${value}`)
            .join(', ');
    };

    const renderSwot = (data: SWOTAnalysis) => (
        <div className="grid grid-cols-2 gap-4 text-xs">
            <div><h3 className="font-bold text-green-700">Сильні сторони:</h3><ul className="list-disc list-inside">{data.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <div><h3 className="font-bold text-red-700">Слабкі сторони:</h3><ul className="list-disc list-inside">{data.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul></div>
            <div><h3 className="font-bold text-blue-700">Можливості:</h3><ul className="list-disc list-inside">{data.opportunities.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
            <div><h3 className="font-bold text-yellow-700">Загрози:</h3><ul className="list-disc list-inside">{data.threats.map((t, i) => <li key={i}>{t}</li>)}</ul></div>
        </div>
    );
    
    const getLogColor = (type: LogEntry['type']) => {
        switch(type) {
            case 'success': return 'text-green-800';
            case 'danger': return 'text-red-800';
            case 'event': return 'text-blue-800';
            default: return 'text-black';
        }
    };

    interface PixelButtonProps { children: ReactNode; onClick?: () => any; disabled?: boolean; className?: string; title?: string; }
    const PixelButton: React.FC<PixelButtonProps> = ({ children, onClick, disabled = false, className = "", title }) => ( <button onClick={onClick} disabled={disabled || gameOver || isLoading} className={`p-2 bg-[#e5e5e5] border-2 border-black text-black text-xs hover:bg-yellow-300 disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`} title={title}>{children}</button> );
    
    return (
        <div className="min-h-screen text-white flex items-center justify-center p-4">
            <main className="w-full max-w-6xl bg-[#71717a] border-4 border-black p-4 grid grid-cols-3 gap-4">
                {/* Left Panel: Game World */}
                <div className="col-span-2 bg-[#a3a3a3] border-2 border-black p-4 flex flex-col items-center justify-between relative">
                    {totalInventoryItems === 0 && !gameOver && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4 z-10">
                            <p className="text-5xl mb-4 animate-bounce">💨</p>
                            <h3 className="text-2xl text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mb-2">Склад порожній!</h3>
                            <p className="text-sm text-gray-300">Час закупити інгредієнти на ринку.</p>
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mb-4 text-center">Цитрін</h1>
                        <div className="bg-green-800 border-4 border-yellow-300 p-8 text-center pixelated w-fit mx-auto"> <p className="text-6xl">🍋</p><p className="mt-2">{companyStructureDetails.name}</p> </div>
                    </div>
                    <div className="w-full mt-4">
                        <h2 className="text-center text-lg mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Конкуренти</h2>
                        <div className="flex justify-around gap-4">{gameState.competitors.map(c => (
                            <div key={c.name} className={`bg-[#e5e5e5] border-2 border-black p-2 text-black text-center text-xs w-48 ${c.activeCampaign ? 'animate-pulse border-red-500' : ''}`}>
                                <p className="font-bold text-sm">{c.name}</p><p className="text-3xl my-1">{c.icon}</p>
                                {c.unlockedProducts.map(id => <p key={id}>{PRODUCT_DETAILS[id].shortName}: ${c.prices[id].toFixed(2)}</p>)}
                                <p className="font-bold mt-1">Частка: {c.marketShare}%</p>
                                <p className="text-xs mt-1">Працівників: {c.employees.length}</p>
                            </div>))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: UI */}
                <div className="col-span-1 bg-[#a3a3a3] border-2 border-black p-2 flex flex-col justify-between">
                    <div>
                        <div className={`bg-[#e5e5e5] border-2 border-black p-2 text-black flex justify-between text-sm mb-2 ${gameState.player.money < 500 ? 'text-red-600 animate-pulse' : ''}`}><span>День: {gameState.day}</span><span>$: {gameState.player.money.toFixed(2)}</span></div>
                        <div className="bg-[#e5e5e5] border-2 border-black p-2 text-black text-xs mb-2">
                             <h3 className="font-bold text-center mb-1">Частка ринку: {gameState.market.playerShare}%</h3>
                             {gameState.socialMedia.activeCampaign && <p className="text-green-600 animate-pulse text-[10px] mt-1 text-center">{gameState.socialMedia.activeCampaign.name} активна!</p>}
                        </div>

                        <div className="bg-[#e5e5e5] border-2 border-black p-2 text-black text-xs mb-2 h-24 overflow-y-auto">{gameState.log.map((item, i) => <p key={i} className={`mb-1 ${getLogColor(item.type)}`}>{item.message}</p>)}</div>
                        
                        <div className="bg-[#e5e5e5] border-2 border-black p-2 text-black text-xs mb-2">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold">Склад:</h3>
                                <PixelButton onClick={()=>setMarketplaceOpen(true)} className='h-5 px-1 py-0 text-[10px]'>Ринок</PixelButton>
                            </div>
                            <div className={`w-full bg-gray-400 border border-black`}>
                                <div className={`h-4 ${totalInventoryItems / warehouseCapacity > 0.9 ? 'bg-red-500' : 'bg-yellow-300'}`} style={{ width: `${(totalInventoryItems / warehouseCapacity) * 100}%`}}></div>
                            </div>
                            <p className="text-center mt-1">Заповнено: {totalInventoryItems} / {warehouseCapacity}</p>
                            <p className="text-xs mt-1">Інгредієнти: Л({gameState.player.inventory.lemons}) Ц({gameState.player.inventory.sugar}) П({gameState.player.inventory.bottles}) О({gameState.player.inventory.oil}) Я({gameState.player.inventory.berries})</p>
                        </div>
                        {/* Products Panel */}
                        <div className="space-y-2">
                          {gameState.player.unlockedProducts.map(id => {
                            const discount = gameState.player.discounts[id];
                            const currentPrice = gameState.player.prices[id];
                            return (
                                <div key={id} className={`bg-[#e5e5e5] border-2 border-black p-2 text-black ${discount ? 'border-yellow-400' : ''}`}>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold">{PRODUCT_DETAILS[id].shortName} ({gameState.player.inventory.products[id]} шт.)</span>
                                        <div className='flex gap-1 items-center'>
                                            <span className="cursor-help font-bold" title={getIngredientTooltip(id)}>(i)</span>
                                            <PixelButton onClick={() => setDiscountModalState({ isOpen: true, productId: id })} className="h-6 w-6 px-1 py-0" title="Встановити знижку">%</PixelButton>
                                            <PixelButton onClick={() => executeCraft(id)} className="h-6 px-1 py-0">Крафт</PixelButton>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs">
                                            Ціна: {discount ? (
                                                <>
                                                    <span className="text-green-600 font-bold">${(currentPrice * (1 - discount.percentage)).toFixed(2)}</span>
                                                    <span className="line-through text-gray-500 ml-1">${currentPrice.toFixed(2)}</span>
                                                    <span className="text-yellow-800 text-[10px] ml-1 bg-yellow-300 px-1">({discount.daysRemaining}д)</span>
                                                </>
                                            ) : (
                                                <span>${currentPrice.toFixed(2)}</span>
                                            )}
                                        </span>
                                        <div>
                                            <PixelButton onClick={() => handlePriceChange(id, -1)} className="w-6 h-6">-</PixelButton>
                                            <PixelButton onClick={() => handlePriceChange(id, 1)} className="w-6 h-6 ml-1">+</PixelButton>
                                        </div>
                                    </div>
                                </div>
                            )
                          })}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <PixelButton onClick={() => { setSwotData(null); setSwotModalOpen(true); }} className="py-2">SWOT</PixelButton>
                        <PixelButton onClick={() => { setEditablePlan(null); setPlanModalOpen(true); }} className="py-2">План</PixelButton>
                        <PixelButton onClick={() => { setCompAnalysisData(null); setCompAnalysisModalOpen(true); }} className="py-2">SWOT Конкур.</PixelButton>
                        <PixelButton onClick={() => setHistoryModalOpen(true)} className="py-2">Історія</PixelButton>
                        <PixelButton onClick={() => setResearchModalOpen(true)} className="py-2">Наука</PixelButton>
                        <PixelButton onClick={() => setSocialMediaModalOpen(true)} className="py-2">SMM</PixelButton>
                        <PixelButton onClick={() => setManagementModalOpen(true)} className="py-3 col-span-3">Управління</PixelButton>
                        <PixelButton onClick={handleNextDay} className="col-span-3 bg-green-500 hover:bg-green-600 py-4">
                            {isLoading ? <div className="w-4 h-4 border-2 border-black border-t-yellow-300 rounded-full animate-spin mx-auto"></div> : 'Наступний день'}
                        </PixelButton>
                    </div>
                </div>
            </main>

            <Modal title="SWOT-Аналіз: Цитрін" isOpen={isSwotModalOpen} onClose={() => setSwotModalOpen(false)}>
                {swotData ? (<>
                    <div className="flex justify-between items-center mb-2"> <PixelButton onClick={() => setIsManualSwot(prev => !prev)}> {isManualSwot ? "Перегляд" : "Редагувати"} </PixelButton> {isManualSwot && <PixelButton onClick={handleSaveSwot} className="bg-green-400 hover:bg-green-500">Зберегти</PixelButton>} </div>
                    {isLoading ? <LoadingSpinner/> : isManualSwot ? <ManualSwotEditor swotData={swotData} setSwotData={setSwotData} /> : renderSwot(swotData)}
                </>) : (
                    <div className="flex flex-col items-center justify-center space-y-4 pt-10"> {isLoading ? <LoadingSpinner/> : <> <p>Створіть SWOT-аналіз вручну або доручіть це ШІ.</p> <div className="flex gap-4"> <PixelButton onClick={handleCreateManualSwot}>Створити вручну</PixelButton> <PixelButton onClick={handleGenerateSwotAI}>Згенерувати ШІ</PixelButton> </div> </>} </div>
                )}
            </Modal>
             <Modal title="SWOT-аналіз конкурентів" isOpen={isCompAnalysisModalOpen} onClose={() => setCompAnalysisModalOpen(false)} wide>
                {isLoading ? <LoadingSpinner /> : compAnalysisData ? (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <PixelButton onClick={() => setManualCompAnalysis(prev => !prev)}>
                                {isManualCompAnalysis ? "Перегляд" : "Редагувати"}
                            </PixelButton>
                            <PixelButton onClick={handleSaveCompAnalysis} className="bg-green-400 hover:bg-green-500">
                                Зберегти в історію
                            </PixelButton>
                        </div>
                        {isManualCompAnalysis ?
                            <ManualCompetitorAnalysisEditor data={compAnalysisData} setData={setCompAnalysisData} /> :
                            <CompetitorAnalysisGrid data={compAnalysisData} />
                        }
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 pt-10">
                        <p>Створіть аналіз конкурентів вручну або доручіть це ШІ.</p>
                        <div className="flex gap-4">
                            <PixelButton onClick={handleCreateManualCompAnalysis}>Створити вручну</PixelButton>
                            <PixelButton onClick={handleGenerateCompAnalysis}>Згенерувати ШІ</PixelButton>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal title="Бізнес-План (Редактор)" isOpen={isPlanModalOpen} onClose={() => setPlanModalOpen(false)}>
                {isLoading ? <LoadingSpinner/> : editablePlan ? ( <> <div className="flex justify-end mb-2"> <PixelButton onClick={handleSavePlan} className="bg-green-400 hover:bg-green-500">Зберегти План</PixelButton> </div> <div className="space-y-4 text-xs"> <div> <h3 className="font-bold">Цілі:</h3> {editablePlan.goals.map((goal, i) => ( <input key={i} type="text" value={goal} onChange={e => handlePlanGoalChange(i, e.target.value)} className="w-full bg-white border-b-2 border-black my-1 p-1" />))} <button onClick={handleAddPlanGoal} className="text-xs bg-gray-200 border border-black px-1 mt-1 hover:bg-yellow-200">+ Додати ціль</button> </div> <FinancialPlanTable rows={editablePlan.financialProjections} isEditable onUpdateRow={handleUpdateFinancialRow} onAddRow={handleAddFinancialRow} onRemoveRow={handleRemoveFinancialRow} /> <GanttChart tasks={editablePlan.ganttTasks} isEditable onUpdateTask={handleGanttTaskUpdate} onRemoveTask={handleGanttTaskRemove} onToggleTaskCompletion={handleToggleGanttTaskCompletion} /> <div className="flex gap-2 items-end border-t-2 border-black pt-2 mt-2"> <input value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} placeholder="Назва задачі" className="flex-grow p-1 border-2 border-white bg-gray-700 text-white" /> <input value={newTask.startDay} onChange={e => setNewTask({...newTask, startDay: +e.target.value})} type="number" placeholder="Старт" className="w-28 p-1 border-2 border-white bg-gray-700 text-white text-center" /> <input value={newTask.endDay} onChange={e => setNewTask({...newTask, endDay: +e.target.value})} type="number" placeholder="Кінець" className="w-28 p-1 border-2 border-white bg-gray-700 text-white text-center" /> <PixelButton onClick={handleAddNewGanttTask}>Додати</PixelButton> </div> </div> </> ) : ( <div className="flex flex-col items-center justify-center space-y-4 pt-10"> <p>Створіть бізнес-план вручну або дозвольте ШІ зробити це за вас.</p> <div className="flex gap-4"> <PixelButton onClick={handleCreateManualPlan}>Створити вручну</PixelButton> <PixelButton onClick={handleGeneratePlanAI}>Згенерувати ШІ</PixelButton> </div> </div> )}
            </Modal>
             <MarketplaceModal isOpen={isMarketplaceOpen} onClose={() => setMarketplaceOpen(false)} onBuy={handleBuyIngredients} playerMoney={gameState.player.money} marketEvent={gameState.market.lastEvent} unlockedProducts={gameState.player.unlockedProducts} currentPrices={gameState.market.currentIngredientPrices} />
             <ResearchModal isOpen={isResearchModalOpen} onClose={() => setResearchModalOpen(false)} projects={RESEARCH_PROJECTS} playerState={gameState.player} onStartResearch={handleStartResearch} />
             <SocialMediaModal 
                isOpen={isSocialMediaModalOpen}
                onClose={() => setSocialMediaModalOpen(false)}
                gameState={gameState}
                onPost={handlePostToSocialMedia}
                onLaunchCampaign={handleLaunchAdCampaign}
                campaigns={PLAYER_AD_CAMPAIGNS}
                isLoading={isLoading}
                onReply={handleReplyToComment}
                onDeletePost={handleDeletePost}
                onBlockUser={handleBlockUser}
                onPinPost={handlePinPost}
                onBoostPost={handleBoostPost}
            />
             <ManagementModal isOpen={isManagementModalOpen} onClose={() => setManagementModalOpen(false)} gameState={gameState} onRentWarehouse={handleRentWarehouse} onHireEmployee={handleHireEmployee} onFireEmployee={handleFireEmployee} onUpgradeStructure={handleUpgradeStructure} allWarehouses={WAREHOUSES_FOR_RENT} companyStructures={COMPANY_STRUCTURES} onUpdateOrgChart={handleUpdateOrgChart} />
             <DiscountModal 
                isOpen={discountModalState.isOpen} 
                onClose={() => setDiscountModalState({ isOpen: false, productId: null })} 
                productId={discountModalState.productId}
                onSetDiscount={handleSetDiscount}
                activeDiscount={discountModalState.productId ? gameState.player.discounts[discountModalState.productId] : undefined}
             />
             
             <Modal title="Історія та Архиви" isOpen={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)}>
                <div className="flex gap-2 border-b-2 border-black pb-2 mb-2">
                    <PixelButton onClick={() => setHistoryView('plan')} className={historyView === 'plan' ? 'bg-yellow-300' : ''}>Бізнес-плани</PixelButton>
                    <PixelButton onClick={() => setHistoryView('swot')} className={historyView === 'swot' ? 'bg-yellow-300' : ''}>Мої SWOT</PixelButton>
                    <PixelButton onClick={() => setHistoryView('comp_analysis')} className={historyView === 'comp_analysis' ? 'bg-yellow-300' : ''}>SWOT Конкурентів</PixelButton>
                </div>
                <div className="max-h-96 overflow-y-auto pr-2">
                    {historyView === 'plan' && planHistory.slice().reverse().map(item => ( <div key={item.day} className="mb-4 p-2 border border-black"><h3 className="font-bold">План від Дня {item.day}</h3><ul>{item.data.goals.map((g, i) => <li key={i}>- {g}</li>)}</ul><GanttChart tasks={item.data.ganttTasks} /></div> ))}
                    {historyView === 'swot' && swotHistory.slice().reverse().map(item => ( <div key={item.day} className="mb-4 p-2 border border-black"><h3 className="font-bold">SWOT від Дня {item.day}</h3>{renderSwot(item.data)}</div> ))}
                    {historyView === 'comp_analysis' && compAnalysisHistory.slice().reverse().map(item => ( <div key={item.day} className="mb-4 p-2 border border-black"><h3 className="font-bold">Аналіз від Дня {item.day}</h3><CompetitorAnalysisGrid data={item.data} /></div> ))}
                </div>
            </Modal>

            <Modal title="Гру Завершено" isOpen={gameOver} onClose={()=>{}}>
                <div className='text-center'> <p className='text-2xl text-red-700 mb-4'>ВАШ БІЗНЕС — БАНКРУТ!</p> <p className='mb-6'>На жаль, ваш баланс опустився нижче нуля. Конкуренти виявилися сильнішими.</p> <PixelButton onClick={restartGame} className='bg-yellow-300 hover:bg-yellow-400'>Спробувати знову</PixelButton> </div>
            </Modal>
        </div>
    );
};

export default App;