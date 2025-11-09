import React from 'react';
import { CompetitorAnalysisData } from '../types';

interface CompetitorAnalysisGridProps {
    data: CompetitorAnalysisData[];
}

const CompetitorAnalysisGrid: React.FC<CompetitorAnalysisGridProps> = ({ data }) => {
    const headers = [
        'НАЗВА КОМПАНІЇ', 'МІСЦЕ РОЗТАШУВАННЯ', 'КОНТАКТНА ІНФОРМАЦІЯ', 
        'ВЕБ-ПОСИЛАННЯ + ПОСИЛАННЯ НА СОЦІАЛЬНІ МЕРЕЖІ', 'ПРАЦІВНИКИ', 'ЩОРІЧНІ РОЗПРОДАЖІ', 
        'ДОХОДИ', 'БІЗНЕС-ЦІННІСТЬ', 'АКЦІЙНА ВАРТІСТЬ'
    ];
    
    // Custom colors matching the image style with improved readability
    const companyColors: Record<string, { bg: string; text: string; }> = {
        'Цитрін': { bg: 'bg-[#6d721d]', text: 'text-white' }, // FIX: Changed text to white for high contrast
        'ZestyCo': { bg: 'bg-[#334155]', text: 'text-white' }, // slate-700
        'FreshFace': { bg: 'bg-[#4b5563]', text: 'text-white' }, // gray-600
    };
    const defaultColor = { bg: 'bg-gray-700', text: 'text-white' };

    return (
        <div className="text-black text-sm overflow-x-auto">
             <style>{`
                .bg-\\[\\#6d721d\\] { background-color: #6d721d; }
                .bg-\\[\\#334155\\] { background-color: #334155; }
                .bg-\\[\\#4b5563\\] { background-color: #4b5563; }
                th { white-space: pre-wrap; }
            `}</style>
            <table className="w-full border-collapse" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', border: '2px solid #99d5f3' }}>
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="p-2 text-white font-normal text-center align-middle" style={{backgroundColor: '#1e3a8a', border: '1px solid #99d5f3'}}>
                                {header.replace(' + ', ' +\n')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((company, rowIndex) => {
                        const companyStyle = companyColors[company.companyName] || defaultColor;
                        return (
                        <tr key={rowIndex}>
                            <td className={`p-2 font-bold text-center align-middle ${companyStyle.bg} ${companyStyle.text}`} style={{ border: '1px solid #99d5f3' }}>
                                {company.companyName.toUpperCase()}
                            </td>
                            <td className="p-2 align-top text-black" style={{ backgroundColor: '#e0f2fe', border: '1px solid #99d5f3' }}>{company.location}</td>
                            <td className="p-2 align-top text-black" style={{ backgroundColor: 'white', border: '1px solid #99d5f3' }}>{company.contactInfo}</td>
                            <td className="p-2 align-top break-all text-black" style={{ backgroundColor: '#e0f2fe', border: '1px solid #99d5f3' }}>{company.links}</td>
                            <td className="p-2 align-top text-black" style={{ backgroundColor: 'white', border: '1px solid #99d5f3' }}>{company.employees}</td>
                            <td className="p-2 align-top text-right text-black" style={{ backgroundColor: '#e0f2fe', border: '1px solid #99d5f3' }}>{company.annualSales}</td>
                            <td className="p-2 align-top text-right text-black" style={{ backgroundColor: 'white', border: '1px solid #99d5f3' }}>{company.revenue}</td>
                            <td className="p-2 align-top text-right text-black" style={{ backgroundColor: '#e0f2fe', border: '1px solid #99d5f3' }}>{company.businessValue}</td>
                            <td className="p-2 align-top text-right text-black" style={{ backgroundColor: 'white', border: '1px solid #99d5f3' }}>{company.stockValue}</td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    );
};

export default CompetitorAnalysisGrid;