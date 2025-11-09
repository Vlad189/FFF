import React from 'react';
import { SWOTAnalysis } from '../types';

interface ManualSwotEditorProps {
    swotData: SWOTAnalysis;
    setSwotData: React.Dispatch<React.SetStateAction<SWOTAnalysis | null>>;
}

type SwotCategory = keyof SWOTAnalysis;

const ManualSwotEditor: React.FC<ManualSwotEditorProps> = ({ swotData, setSwotData }) => {

    const handleUpdate = (category: SwotCategory, index: number, value: string) => {
        setSwotData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [category]: prev[category].map((item, i) => i === index ? value : item),
            };
        });
    };

    const handleAdd = (category: SwotCategory) => {
        setSwotData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [category]: [...prev[category], 'Новий пункт...'],
            };
        });
    };

    const handleRemove = (category: SwotCategory, index: number) => {
        setSwotData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [category]: prev[category].filter((_, i) => i !== index),
            };
        });
    };

    const renderCategoryEditor = (category: SwotCategory, title: string, color: string) => (
        <div>
            <h3 className={`font-bold ${color}`}>{title}:</h3>
            <div className="space-y-1 mt-1">
                {swotData[category].map((item, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdate(category, index, e.target.value)}
                            className="w-full text-xs p-1 bg-white/80 border border-black focus:outline-yellow-400"
                        />
                        <button
                            onClick={() => handleRemove(category, index)}
                            className="text-red-600 hover:text-red-800 font-bold text-sm"
                            title="Видалити"
                        >
                            x
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => handleAdd(category)}
                    className="text-xs bg-gray-200 border border-black px-1 hover:bg-yellow-200"
                >
                    + Додати
                </button>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 gap-4 text-xs">
            {renderCategoryEditor('strengths', 'Сильні сторони', 'text-green-700')}
            {renderCategoryEditor('weaknesses', 'Слабкі сторони', 'text-red-700')}
            {renderCategoryEditor('opportunities', 'Можливості', 'text-blue-700')}
            {renderCategoryEditor('threats', 'Загрози', 'text-yellow-700')}
        </div>
    );
};

export default ManualSwotEditor;