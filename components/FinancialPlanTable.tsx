import React from 'react';
import { FinancialProjectionRow } from '../types';

interface FinancialPlanTableProps {
    rows: FinancialProjectionRow[];
    isEditable?: boolean;
    onUpdateRow: (rowId: string, field: keyof Omit<FinancialProjectionRow, 'id' | 'netIncome'>, value: string | number) => void;
    onAddRow: () => void;
    onRemoveRow: (rowId: string) => void;
}

const FinancialPlanTable: React.FC<FinancialPlanTableProps> = ({ rows, isEditable = false, onUpdateRow, onAddRow, onRemoveRow }) => {
    
    const handleCellChange = (rowId: string, field: keyof Omit<FinancialProjectionRow, 'id' | 'netIncome'>, value: string) => {
        const numericValue = field === 'period' ? value : parseFloat(value) || 0;
        onUpdateRow(rowId, field, numericValue);
    };

    const calculateNetIncome = (row: FinancialProjectionRow) => {
        return row.income - row.expenses - row.additionalExpenses;
    };
    
    const getInputClasses = (isText: boolean = false) => {
        const base = "w-full p-1 outline-none text-xs";
        const editable = "bg-white border border-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500";
        const readOnly = "bg-transparent border-transparent cursor-default";
        const textAlignment = isText ? "" : "text-right";
        return `${base} ${textAlignment} ${isEditable ? editable : readOnly}`;
    }

    return (
        <div>
            <h3 className="font-bold mb-2 text-base">Фінансовий План</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-2 border-black text-black text-xs bg-gray-200">
                    <thead>
                        <tr className="border-b-2 border-black bg-gray-300">
                            <th className="px-3 py-2 text-left font-normal whitespace-nowrap min-w-40">Період</th>
                            <th className="px-3 py-2 text-right font-normal">Капітал</th>
                            <th className="px-3 py-2 text-right font-normal">Дохід</th>
                            <th className="px-3 py-2 text-right font-normal">Витрати</th>
                            <th className="px-3 py-2 text-right font-normal whitespace-nowrap">Дод. витрати</th>
                            <th className="px-3 py-2 text-right whitespace-nowrap">Чистий дохід</th>
                            {isEditable && <th className="w-8"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.id} className="border-b border-black last:border-b-0 hover:bg-gray-100">
                                <td className="px-2 py-1"><input type="text" value={row.period} onChange={e => handleCellChange(row.id, 'period', e.target.value)} className={`${getInputClasses(true)} font-bold`} readOnly={!isEditable} /></td>
                                <td className="px-2 py-1"><input type="number" value={row.capital} onChange={e => handleCellChange(row.id, 'capital', e.target.value)} className={getInputClasses()} readOnly={!isEditable} /></td>
                                <td className="px-2 py-1"><input type="number" value={row.income} onChange={e => handleCellChange(row.id, 'income', e.target.value)} className={getInputClasses()} readOnly={!isEditable} /></td>
                                <td className="px-2 py-1"><input type="number" value={row.expenses} onChange={e => handleCellChange(row.id, 'expenses', e.target.value)} className={getInputClasses()} readOnly={!isEditable} /></td>
                                <td className="px-2 py-1"><input type="number" value={row.additionalExpenses} onChange={e => handleCellChange(row.id, 'additionalExpenses', e.target.value)} className={getInputClasses()} readOnly={!isEditable} /></td>
                                <td className="px-3 py-2 text-right font-bold">{calculateNetIncome(row).toFixed(2)}</td>
                                {isEditable && (
                                    <td className="px-2 py-1 text-center">
                                        <button onClick={() => onRemoveRow(row.id)} className="text-red-600 hover:text-red-800 font-bold">x</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isEditable && (
                <button onClick={onAddRow} className="mt-2 text-xs bg-gray-300 border border-black px-2 py-1 hover:bg-yellow-200">
                    + Додати Рядок
                </button>
            )}
        </div>
    );
};

export default FinancialPlanTable;