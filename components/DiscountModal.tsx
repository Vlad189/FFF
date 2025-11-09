import React, { useState } from 'react';
import Modal from './Modal';
import { ProductId, PRODUCT_DETAILS, Discount } from '../types';

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: ProductId | null;
    onSetDiscount: (productId: ProductId, percentage: number, duration: number, cost: number) => void;
    activeDiscount: Discount | undefined;
}

interface PixelButtonProps {
    children: React.ReactNode;
    onClick?: () => any;
    disabled?: boolean;
    className?: string;
}
const PixelButton: React.FC<PixelButtonProps> = ({ children, onClick, disabled = false, className = "" }) => (
    <button onClick={onClick} disabled={disabled} className={`p-2 bg-[#e5e5e5] border-2 border-black text-black text-xs hover:bg-yellow-300 disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}>{children}</button>
);

const DISCOUNT_OPTIONS = [
    { percentage: 0.10, label: '10%' },
    { percentage: 0.25, label: '25%' },
    { percentage: 0.50, label: '50%' },
];

const DURATION_OPTIONS = [
    { days: 3, label: '3 дні' },
    { days: 5, label: '5 днів' },
    { days: 7, label: '7 днів' },
];

const SALE_SETUP_COST = 50;

const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose, productId, onSetDiscount, activeDiscount }) => {
    const [selectedDiscount, setSelectedDiscount] = useState(0.10);
    const [selectedDuration, setSelectedDuration] = useState(3);

    if (!productId) return null;
    
    const productName = PRODUCT_DETAILS[productId].name;

    const handleConfirm = () => {
        onSetDiscount(productId, selectedDiscount, selectedDuration, SALE_SETUP_COST);
    };
    
    if (activeDiscount) {
         return (
            <Modal title={`Акція: ${productName}`} isOpen={isOpen} onClose={onClose}>
                <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">На цей товар вже діє знижка!</h3>
                    <p>Відсоток: <span className="font-bold">{activeDiscount.percentage * 100}%</span></p>
                    <p>Залишилось днів: <span className="font-bold">{activeDiscount.daysRemaining}</span></p>
                    <p className="text-xs mt-4 text-gray-500">Дочекайтесь завершення поточної акції, щоб розпочати нову.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal title={`Знижка на: ${productName}`} isOpen={isOpen} onClose={onClose}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold mb-2">Розмір знижки:</h4>
                    <div className="flex gap-2">
                        {DISCOUNT_OPTIONS.map(opt => (
                            <PixelButton 
                                key={opt.percentage}
                                onClick={() => setSelectedDiscount(opt.percentage)}
                                className={selectedDiscount === opt.percentage ? 'bg-yellow-300' : ''}
                            >
                                {opt.label}
                            </PixelButton>
                        ))}
                    </div>
                </div>
                 <div>
                    <h4 className="font-bold mb-2">Тривалість акції:</h4>
                    <div className="flex gap-2">
                        {DURATION_OPTIONS.map(opt => (
                             <PixelButton 
                                key={opt.days}
                                onClick={() => setSelectedDuration(opt.days)}
                                className={selectedDuration === opt.days ? 'bg-yellow-300' : ''}
                            >
                                {opt.label}
                            </PixelButton>
                        ))}
                    </div>
                </div>
                <div className="border-t-2 border-black pt-4 flex justify-between items-center">
                    <p className="text-xs">Вартість запуску акції: <span className="font-bold">${SALE_SETUP_COST}</span></p>
                    <PixelButton onClick={handleConfirm} className="bg-green-400 hover:bg-green-500">
                        Розпочати розпродаж
                    </PixelButton>
                </div>
            </div>
        </Modal>
    );
};

export default DiscountModal;
