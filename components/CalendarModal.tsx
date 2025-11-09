import React, { useMemo } from 'react';
import Modal from './Modal';
import { GameState, CalendarEvent, MarketEvent, PRODUCT_DETAILS } from '../types';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    allMarketEvents: MarketEvent[];
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, gameState, allMarketEvents }) => {
    const { day, player, socialMedia } = gameState;

    const events = useMemo(() => {
        const futureEvents: CalendarEvent[] = [];
        const daysToScan = 14;

        // Player-driven events
        if (player.activeResearch) {
            futureEvents.push({
                day: day + player.activeResearch.daysRemaining,
                title: `Завершення дослідження: ${PRODUCT_DETAILS[player.activeResearch.projectId].shortName}`,
                type: 'research'
            });
        }
        if (socialMedia.activeCampaign) {
            futureEvents.push({
                day: day + socialMedia.activeCampaign.daysRemaining,
                title: `Кінець кампанії: ${socialMedia.activeCampaign.name}`,
                type: 'marketing'
            });
        }
        Object.entries(player.discounts).forEach(([productId, discount]) => {
            if (discount) {
                futureEvents.push({
                    day: day + discount.daysRemaining,
                    title: `Кінець знижки на ${PRODUCT_DETAILS[productId as keyof typeof player.discounts].shortName}`,
                    type: 'discount'
                });
            }
        });

        // Scheduled market events
        allMarketEvents.forEach(marketEvent => {
            if (marketEvent.scheduledDay && marketEvent.scheduledDay > day && marketEvent.scheduledDay <= day + daysToScan) {
                futureEvents.push({
                    day: marketEvent.scheduledDay,
                    title: `Ринкова подія: ${marketEvent.message.split('!')[0]}`,
                    type: 'market'
                });
            }
        });
        
        return futureEvents.sort((a,b) => a.day - b.day);

    }, [day, player, socialMedia, allMarketEvents]);

    const getEventStyle = (type: CalendarEvent['type']) => {
        switch(type) {
            case 'research': return 'bg-blue-200 border-blue-500';
            case 'marketing': return 'bg-purple-200 border-purple-500';
            case 'discount': return 'bg-yellow-200 border-yellow-500';
            case 'market': return 'bg-red-200 border-red-500';
            default: return 'bg-gray-200 border-gray-500';
        }
    }
    
    const renderDay = (date: number) => {
        const eventsForDay = events.filter(e => e.day === date);
        return (
            <div key={date} className={`p-2 border-2 border-black ${date === day ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                <h4 className={`font-bold ${date === day ? 'text-blue-700' : ''}`}>День {date}</h4>
                {eventsForDay.length > 0 ? (
                    <div className="space-y-1 mt-1">
                        {eventsForDay.map((event, index) => (
                             <div key={index} className={`p-1 text-xs border-l-4 ${getEventStyle(event.type)}`}>
                                {event.title}
                             </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 italic">Немає запланованих подій</p>
                )}
            </div>
        )
    }

    return (
        <Modal title="Календар Подій" isOpen={isOpen} onClose={onClose}>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
               {Array.from({ length: 14 }, (_, i) => renderDay(day + i))}
            </div>
        </Modal>
    );
};

export default CalendarModal;