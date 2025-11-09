import React from 'react';
import { CompetitorAnalysisData } from '../types';

interface ManualCompetitorAnalysisEditorProps {
    data: CompetitorAnalysisData[];
    setData: React.Dispatch<React.SetStateAction<CompetitorAnalysisData[] | null>>;
}

const ManualCompetitorAnalysisEditor: React.FC<ManualCompetitorAnalysisEditorProps> = ({ data, setData }) => {

    const handleUpdate = (rowIndex: number, field: keyof CompetitorAnalysisData, value: string) => {
        setData(prevData => {
            if (!prevData) return null;
            const newData = [...prevData];
            newData[rowIndex] = { ...newData[rowIndex], [field]: value };
            return newData;
        });
    };

    const addCompetitor = () => {
        setData(prevData => {
            const newCompetitor: CompetitorAnalysisData = {
                companyName: 'Новий Конкурент',
                location: '', contactInfo: '', links: '', employees: '',
                annualSales: '', revenue: '', businessValue: '', stockValue: ''
            };
            return prevData ? [...prevData, newCompetitor] : [newCompetitor];
        });
    };

    const removeCompetitor = (rowIndex: number) => {
        setData(prevData => {
            if (!prevData) return null;
            // Prevent removing the player's company
            if (prevData[rowIndex].companyName === 'Цитрін') return prevData;
            return prevData.filter((_, index) => index !== rowIndex);
        });
    };
    
    const headers: { key: keyof CompetitorAnalysisData; label: string; }[] = [
        { key: 'companyName', label: 'НАЗВА КОМПАНІЇ' },
        { key: 'location', label: 'МІСЦЕ РОЗТАШУВАННЯ' },
        { key: 'contactInfo', label: 'КОНТАКТНА ІНФОРМАЦІЯ' },
        { key: 'links', label: 'ПОСИЛАННЯ' },
        { key: 'employees', label: 'ПРАЦІВНИКИ' },
        { key: 'annualSales', label: 'ЩОРІЧНІ РОЗПРОДАЖІ' },
        { key: 'revenue', label: 'ДОХОДИ' },
        { key: 'businessValue', label: 'БІЗНЕС-ЦІННІСТЬ' },
        { key: 'stockValue', label: 'АКЦІЙНА ВАРТІСТЬ' }
    ];

    return (
        <div className="text-black text-sm overflow-x-auto">
            <style>{`.bg-\\[\\#6d721d\\] { background-color: #6d721d; }`}</style>
            <table className="w-full border-collapse border border-gray-400" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
                <thead>
                    <tr>
                        {headers.map(h => <th key={h.key} className="p-2 border border-blue-900 bg-blue-800 text-white text-sm font-normal">{h.label}</th>)}
                        <th className="p-2 border border-blue-900 bg-blue-800 w-12"></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((company, rowIndex) => {
                        const isPlayerRow = company.companyName === 'Цитрін';
                        return (
                        <tr key={rowIndex} className={isPlayerRow ? 'bg-[#6d721d]' : 'bg-white'}>
                            {headers.map(header => (
                                <td key={header.key} className="border border-gray-300 p-0">
                                    <input
                                        type="text"
                                        value={company[header.key]}
                                        onChange={(e) => handleUpdate(rowIndex, header.key, e.target.value)}
                                        className={`w-full h-full p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 border-none ${isPlayerRow ? 'bg-transparent text-white placeholder-gray-300 focus:bg-gray-800/50' : 'bg-white text-black focus:bg-yellow-100'}`}
                                        // Player company name should not be editable
                                        readOnly={header.key === 'companyName' && isPlayerRow}
                                        placeholder={isPlayerRow ? '...' : ''}
                                    />
                                </td>
                            ))}
                             <td className="border border-gray-300 text-center">
                                {!isPlayerRow && (
                                    <button onClick={() => removeCompetitor(rowIndex)} className="text-red-600 font-bold p-1 text-lg">X</button>
                                )}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
            <button onClick={addCompetitor} className="mt-2 text-xs bg-gray-200 border border-black px-2 py-1 hover:bg-yellow-200">
                + Додати конкурента
            </button>
        </div>
    );
};

export default ManualCompetitorAnalysisEditor;