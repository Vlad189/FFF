import React from 'react';
import Modal from './Modal';
import { ResearchProject, PlayerState, ProductId } from '../types';

interface ResearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: ResearchProject[];
    playerState: PlayerState;
    onStartResearch: (project: ResearchProject) => void;
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

const ResearchModal: React.FC<ResearchModalProps> = ({ isOpen, onClose, projects, playerState, onStartResearch }) => {
    const { money, unlockedProducts, activeResearch } = playerState;

    if (activeResearch) {
        const project = projects.find(p => p.id === activeResearch.projectId)!;
        const progress = ((project.duration - activeResearch.daysRemaining) / project.duration) * 100;
        return (
             <Modal title="Центр Досліджень" isOpen={isOpen} onClose={onClose}>
                <div className="text-center">
                    <h3 className="font-bold text-lg">Триває дослідження:</h3>
                    <p className="text-base mb-2">{project.name}</p>
                    <p className="text-xs mb-4">{project.description}</p>
                    <div className="w-full bg-gray-400 border border-black my-2">
                        <div className="h-6 bg-green-500 text-black text-center" style={{ width: `${progress}%` }}>
                           {Math.round(progress)}%
                        </div>
                    </div>
                    <p>Залишилось днів: <span className="font-bold">{activeResearch.daysRemaining}</span></p>
                </div>
            </Modal>
        )
    }

    const availableProjects = projects.filter(p => !unlockedProducts.includes(p.id));

    return (
        <Modal title="Центр Досліджень" isOpen={isOpen} onClose={onClose}>
            <div>
                <p className="text-right font-bold mb-4">Ваш бюджет: ${money.toFixed(2)}</p>
                <div className="space-y-4">
                    {availableProjects.length > 0 ? availableProjects.map(project => {
                        const canAfford = money >= project.cost;
                        return (
                            <div key={project.id} className="bg-gray-100 border-2 border-black p-3">
                                <h4 className="font-bold text-base">{project.name}</h4>
                                <p className="text-xs my-2">{project.description}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs">
                                        Вартість: <span className="font-bold">${project.cost}</span> / 
                                        Тривалість: <span className="font-bold">{project.duration} днів</span>
                                    </p>
                                    <PixelButton
                                        onClick={() => onStartResearch(project)}
                                        disabled={!canAfford || !!activeResearch}
                                        className="w-40"
                                    >
                                        Почати
                                    </PixelButton>
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-center py-8">Всі доступні дослідження завершено!</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ResearchModal;