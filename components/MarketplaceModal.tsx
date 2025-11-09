import React from 'react';
import Modal from './Modal';
import { INGREDIENT_PRICES, MarketEvent, ProductId } from '../types';

interface MarketplaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBuy: (ingredient: keyof typeof INGREDIENT_PRICES, quantity: number) => void;
    playerMoney: number;
    marketEvent: MarketEvent | null;
    unlockedProducts: ProductId[];
    currentPrices: Record<keyof typeof INGREDIENT_PRICES, number>;
}

interface PixelButtonProps {
    children: React.ReactNode;
    onClick: () => any;
    disabled?: boolean;
    className?: string;
}
const PixelButton: React.FC<PixelButtonProps> = ({ children, onClick, disabled = false, className = "" }) => (
    <button onClick={onClick} disabled={disabled} className={`p-2 bg-[#e5e5e5] border-2 border-black text-black text-xs hover:bg-yellow-300 disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}>{children}</button>
);


const MarketplaceModal: React.FC<MarketplaceModalProps> = ({ isOpen, onClose, onBuy, playerMoney, marketEvent, unlockedProducts, currentPrices }) => {
    const buyQuantity = 10;
    const ingredientNames = {
        lemons: "Лимони",
        sugar: "Цукор",
        bottles: "Пляшки",
        oil: "Ефірна олія",
        berries: "Ягоди",
    };

    const allIngredients = Object.keys(INGREDIENT_PRICES) as Array<keyof typeof INGREDIENT_PRICES>;
    
    // Filter ingredients based on unlocked products
    const availableIngredients = allIngredients.filter(ingredient => {
        if (ingredient === 'berries') {
            return unlockedProducts.includes('berry_mask');
        }
        return true;
    });
    
    const getPrice = (ingredient: keyof typeof INGREDIENT_PRICES) => {
        let price = currentPrices[ingredient];
        if (marketEvent?.id === 'ingredient_surplus' && ingredient === 'lemons') {
            return price * 0.5;
        }
        return price;
    }

    return (
        <Modal title="Ринок Постачальників" isOpen={isOpen} onClose={onClose}>
            <div className="space-y-3">
                <p className="text-right font-bold">Ваш бюджет: ${playerMoney.toFixed(2)}</p>
                {marketEvent?.id === 'ingredient_surplus' && <p className="text-center text-green-700 font-bold animate-pulse">Знижка на лимони 50%!</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableIngredients.length > 0 ? availableIngredients.map(ingredient => {
                        const dynamicPrice = getPrice(ingredient);
                        const cost = dynamicPrice * buyQuantity;
                        const canAfford = playerMoney >= cost;
                        return (
                            <div key={ingredient} className="bg-gray-100 border-2 border-black p-3 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{ingredientNames[ingredient]}</p>
                                    <p className="text-xs">Ціна: ${dynamicPrice.toFixed(2)}/шт.
                                        {(marketEvent?.id === 'ingredient_surplus' && ingredient === 'lemons') && <span className='line-through ml-1 text-gray-500'>${(dynamicPrice / 0.5).toFixed(2)}</span>}
                                    </p>
                                </div>
                                <PixelButton 
                                    onClick={() => onBuy(ingredient, buyQuantity)}
                                    disabled={!canAfford}
                                    className="w-32"
                                >
                                    Купити {buyQuantity} за ${cost.toFixed(2)}
                                </PixelButton>
                            </div>
                        );
                    }) : <p className="text-center col-span-2">Дослідіть нові продукти, щоб розблокувати більше інгредієнтів!</p>}
                </div>
            </div>
        </Modal>
    );
};

export default MarketplaceModal;