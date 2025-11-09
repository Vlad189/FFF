import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, SWOTAnalysis, BusinessPlan, ProductId, SimulatedComment, CompetitorAnalysisData } from '../types';
import { PRODUCT_DETAILS } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = 'gemini-2.5-flash';

const commonSystemInstruction = `Ти — бізнес-аналітик у грі-симуляторі "Цитрін". Гравець керує брендом косметики на основі лимонів. Твої відповіді мають бути короткими, влучними, у стилі ретро-ігор, і базуватися на наданих даних. Відповідай виключно українською мовою у форматі JSON.`;

function formatPrices(prices: Record<ProductId, number>, unlockedProducts: ProductId[]): string {
    return unlockedProducts
        .map(id => `${PRODUCT_DETAILS[id].shortName}: $${prices[id]}`)
        .join(', ');
}


export async function generateDynamicSwot(gameState: GameState): Promise<SWOTAnalysis> {
  const { player, competitors } = gameState;
  const prompt = `
    Проведи SWOT-аналіз для бренду "Цитрін" на основі поточних даних:
    - Гроші гравця: ${player.money}
    - Ціни гравця: ${formatPrices(player.prices, player.unlockedProducts)}
    - Запаси: ${player.unlockedProducts.map(id => `${PRODUCT_DETAILS[id].shortName}: ${player.inventory.products[id]}`).join(', ')}
    - Конкурент 1 (${competitors[0].name}): ціни ${formatPrices(competitors[0].prices, competitors[0].unlockedProducts)}, ринкова частка ${competitors[0].marketShare}%
    - Конкурент 2 (${competitors[1].name}): ціни ${formatPrices(competitors[1].prices, competitors[1].unlockedProducts)}, ринкова частка ${competitors[1].marketShare}%
    Сформулюй по 2 пункти для кожної категорії.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: commonSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          threats: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["strengths", "weaknesses", "opportunities", "threats"],
      },
    },
  });

    try {
        return JSON.parse(response.text.trim()) as SWOTAnalysis;
    } catch (error) {
        console.error("Failed to parse SWOT Analysis JSON:", response.text, error);
        throw new Error("Malformed JSON response from AI for SWOT analysis.");
    }
}

export async function generateCompetitorAnalysisGrid(gameState: GameState): Promise<CompetitorAnalysisData[]> {
  const { competitors } = gameState;
  const companyNames = ["Цитрін", ...competitors.map(c => c.name)];

  const prompt = `
    Створи порівняльну таблицю для косметичних брендів у грі-симуляторі "Цитрін".
    Бренди для аналізу: ${companyNames.join(', ')}.
    "Цитрін" - це компанія гравця, стартап.
    ${competitors.map(c => `"${c.name}" - конкурент з ринковою часткою ${c.marketShare}%.`).join('\n')}
    
    Для кожного бренду згенеруй правдоподібні, але вигадані дані для наступних колонок:
    - companyName: Назва компанії.
    - location: Місто, країна.
    - contactInfo: Email або телефон.
    - links: Веб-сайт та одна соцмережа.
    - employees: Приблизна кількість працівників (рядок, напр. "10-20").
    - annualSales: Річні продажі в доларах (рядок, напр. "$100,000 - $150,000").
    - revenue: Дохід в доларах (рядок).
    - businessValue: Оціночна вартість бізнесу (рядок).
    - stockValue: Ринкова вартість однієї акції. Вигадай правдоподібне значення (напр. "$45.50 / акція").

    Дані для "Цитрін" мають відображати його статус як меншої компанії порівняно з конкурентами.
    Дані для конкурентів мають відповідати їхній ринковій частці.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: commonSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            location: { type: Type.STRING },
            contactInfo: { type: Type.STRING },
            links: { type: Type.STRING },
            employees: { type: Type.STRING },
            annualSales: { type: Type.STRING },
            revenue: { type: Type.STRING },
            businessValue: { type: Type.STRING },
            stockValue: { type: Type.STRING },
          },
          required: ["companyName", "location", "contactInfo", "links", "employees", "annualSales", "revenue", "businessValue", "stockValue"],
        }
      },
    },
  });

  try {
    const result = JSON.parse(response.text.trim()) as CompetitorAnalysisData[];
    // Ensure the player's company is first
    return result.sort((a, b) => {
        if (a.companyName === 'Цитрін') return -1;
        if (b.companyName === 'Цитрін') return 1;
        return a.companyName.localeCompare(b.companyName);
    });
  } catch (error) {
    console.error("Failed to parse Competitor Analysis Grid JSON:", response.text, error);
    throw new Error("Malformed JSON response from AI for Competitor Analysis Grid.");
  }
}


export async function generateBusinessPlan(gameState: GameState): Promise<BusinessPlan> {
  const { player } = gameState;
  const prompt = `
    Створи детальний бізнес-план для бренду 'Цитрін' на перший рік (365 днів).
    Легенда: бізнес починається з нуля, продукція продається на ярмарках та в соцмережах.
    Поточний стан: гроші - $${player.money}, ціни - ${formatPrices(player.prices, player.unlockedProducts)}.

    План повинен містити:
    1.  **Короткострокові цілі**: 2-3 чіткі цілі на рік.
    2.  **Фінансовий Прогноз**: Створи таблицю з 4 рядків (наприклад, "Квартал 1", "Квартал 2", "Квартал 3", "Квартал 4"). Для кожного рядка згенеруй унікальний id і заповни такі поля: період(period), капітал(capital), дохід(income), витрати(expenses), додаткові витрати(additionalExpenses), чистий дохід(netIncome).
    3.  **Діаграма Ганта**: 5-7 ключових завдань для проєкту з унікальним id, назвою, днем початку та днем завершення в межах 365 днів.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction: commonSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          goals: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Список короткострокових цілей"
          },
          financialProjections: {
            type: Type.ARRAY,
            description: "Фінансовий прогноз по періодах",
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                period: { type: Type.STRING },
                capital: { type: Type.NUMBER },
                income: { type: Type.NUMBER },
                expenses: { type: Type.NUMBER },
                additionalExpenses: { type: Type.NUMBER },
                netIncome: { type: Type.NUMBER }
              },
              required: ["id", "period", "capital", "income", "expenses", "additionalExpenses", "netIncome"]
            }
          },
          ganttTasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                startDay: { type: Type.NUMBER },
                endDay: { type: Type.NUMBER },
                isCompleted: { type: Type.BOOLEAN, description: "Чи виконано завдання" }
              },
              required: ["id", "name", "startDay", "endDay"]
            }
          }
        },
        required: ["goals", "financialProjections", "ganttTasks"]
      },
    },
  });

    try {
        return JSON.parse(response.text.trim()) as BusinessPlan;
    } catch (error) {
        console.error("Failed to parse Business Plan JSON:", response.text, error);
        throw new Error("Malformed JSON response from AI for Business Plan.");
    }
}

export async function generateSocialMediaComments(postContent: string): Promise<SimulatedComment[]> {
    const prompt = `
        Гравець у грі-симуляторі косметичного бренду "Цитрін" щойно опублікував наступний пост у соцмережах:
        "${postContent}"

        Згенеруй 3-4 коментарі від різних вигаданих користувачів. Коментарі мають бути короткими, реалістичними, і відображати різне ставлення: позитивне, негативне та нейтральне. Включи імена користувачів.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: `Ти — симулятор соціальних мереж. Твоє завдання — створювати реалістичні коментарі до постів. Відповідай українською мовою у форматі JSON.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        author: { type: Type.STRING, description: "Ім'я користувача" },
                        text: { type: Type.STRING, description: "Текст коментаря" },
                        sentiment: { type: Type.STRING, description: "Настрій: 'positive', 'negative', або 'neutral'" },
                    },
                    required: ["author", "text", "sentiment"]
                }
            }
        }
    });

    try {
        return JSON.parse(response.text.trim()) as SimulatedComment[];
    } catch (error) {
        console.error("Failed to parse Social Media Comments JSON:", response.text, error);
        throw new Error("Malformed JSON response from AI for Social Media Comments.");
    }
}

export async function generateCompetitorPost(competitorName: string, gameState: GameState, target?: string): Promise<string> {
    const competitor = gameState.competitors.find(c => c.name === competitorName);
    if (!competitor) return "";
    
    let prompt: string;
    if (target) {
        prompt = `
            Ти — SMM-менеджер бренду '${competitorName}'. Твоя ціль — атакувати конкурента '${target}'.
            Створи короткий, але їдкий пост, що натякає на недоліки продукції або сервісу '${target}'.
            Не згадуй назву конкурента прямо, використовуй натяки.
        `;
    } else {
        prompt = `
            Ти — SMM-менеджер бренду '${competitorName}'. Створи короткий, яскравий пост для соцмереж.
            Ти можеш прорекламувати один з продуктів або оголосити знижку.
            Твій головний конкурент - 'Цитрін'. Пост має бути впевненим і конкурентним.
            Продукти ${competitorName}: ${formatPrices(competitor.prices, competitor.unlockedProducts)}.
        `;
    }

    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: "Ти — симулятор SMM-менеджера. Твої пости мають бути короткими та влучними. Відповідай українською мовою, надаючи тільки текст для посту у форматі JSON з полем 'postContent'.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { postContent: { type: Type.STRING } },
                required: ["postContent"]
            }
        }
    });
    try {
        const data = JSON.parse(response.text.trim()) as {postContent: string};
        return data.postContent;
    } catch (error) {
        console.error("Failed to parse Competitor Post JSON:", response.text, error);
        throw new Error("Malformed JSON response from AI for Competitor Post.");
    }
}


export async function generateCompetitorComment(competitorName: string, playerPostContent: string): Promise<Pick<SimulatedComment, 'author' | 'text'>> {
     const prompt = `
        Твій конкурент 'Цитрін' щойно опублікував пост: "${playerPostContent}".
        Як SMM-менеджер бренду '${competitorName}', напиши короткий, уїдливий або провокаційний коментар у відповідь.
    `;
     const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: `Ти — SMM-менеджер. Відповідай українською мовою у форматі JSON з полями 'author' (це '${competitorName}') та 'text'.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    author: { type: Type.STRING },
                    text: { type: Type.STRING }
                },
                required: ["author", "text"]
            }
        }
    });
    try {
        return JSON.parse(response.text.trim()) as Pick<SimulatedComment, 'author' | 'text'>;
    } catch (error) {
        console.error("Failed to parse Competitor Comment JSON:", response.text, error);
        throw new Error("Malformed JSON response from AI for Competitor Comment.");
    }
}

export async function generateNegativeBotComments(initiator: string, count: number): Promise<SimulatedComment[]> {
    const prompt = `
        Бренд '${initiator}' запустив "атаку ботів" на свого конкурента.
        Згенеруй ${count} коротких, негативних, дещо шаблонних коментарів від вигаданих користувачів (ботів).
        Коментарі мають критикувати якість, ціну або сервіс конкурента.
    `;
     const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction: "Ти — симулятор атаки ботів. Створюй негативні коментарі. Відповідай українською мовою у форматі JSON.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        author: { type: Type.STRING, description: "Вигадане ім'я бота" },
                        text: { type: Type.STRING, description: "Негативний коментар" },
                        sentiment: { type: Type.STRING, description: "Завжди 'negative'" }
                    },
                    required: ["author", "text", "sentiment"]
                }
            }
        }
    });
    try {
        return JSON.parse(response.text.trim()) as SimulatedComment[];
    } catch (error) {
        console.error("Failed to parse Negative Bot Comments JSON:", response.text, error);
        throw new Error("Malformed JSON response from AI for Negative Bot Comments.");
    }
}
