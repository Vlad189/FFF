import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { GameState, Warehouse, Employee, CompanyStructure, CompanyStructureId, OrgChartNode } from '../types';
import OrgChartDisplay from './OrgChartDisplay';

interface ManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameState: GameState;
    onRentWarehouse: (warehouse: Warehouse) => void;
    onHireEmployee: (employee: Employee, source: 'pool' | 'competitor', competitorName?: string) => void;
    onFireEmployee: (employeeId: string) => void;
    onUpgradeStructure: (structure: CompanyStructure) => void;
    allWarehouses: Warehouse[];
    companyStructures: Record<CompanyStructureId, CompanyStructure>;
    onUpdateOrgChart: (newChart: OrgChartNode) => void;
}

const PixelButton: React.FC<{ children: React.ReactNode; onClick?: () => any; disabled?: boolean; className?: string; title?: string; }> = ({ children, onClick, disabled = false, className = "", title }) => (
    <button onClick={onClick} disabled={disabled} className={`p-2 bg-[#e5e5e5] border-2 border-black text-black text-xs hover:bg-yellow-300 disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`} title={title}>{children}</button>
);

type ManagementView = 'employees' | 'warehouses' | 'structure' | 'orgchart';

const ManagementModal: React.FC<ManagementModalProps> = ({
    isOpen,
    onClose,
    gameState,
    onRentWarehouse,
    onHireEmployee,
    onFireEmployee,
    onUpgradeStructure,
    allWarehouses,
    companyStructures,
    onUpdateOrgChart,
}) => {
    const [view, setView] = useState<ManagementView>('employees');
    const { player, availableEmployees, competitors, orgChart } = gameState;
    const currentStructure = companyStructures[player.companyStructure];

    const allCompetitorEmployees = useMemo(() => 
        competitors.flatMap(c => c.employees.map(e => ({...e, competitorName: c.name})))
    , [competitors]);

    const renderWarehouses = () => (
        <div>
            <h4 className="font-bold mb-2">Ваші склади ({player.warehouses.length}/{currentStructure.warehouseLimit}):</h4>
            <div className="space-y-2 mb-4">
                {player.warehouses.map(wh => (
                    <div key={wh.id} className="bg-gray-100 p-2 border border-black">
                        <p>{wh.name} (Місткість: {wh.capacity}, Оренда: ${wh.dailyCost}/день)</p>
                    </div>
                ))}
            </div>
            <h4 className="font-bold mb-2">Доступні для оренди:</h4>
            <div className="space-y-2">
                {allWarehouses
                    .filter(wh => !player.warehouses.some(pwh => pwh.id === wh.id))
                    .map(wh => (
                    <div key={wh.id} className="bg-gray-100 p-2 border border-black flex justify-between items-center">
                        <div>
                           <p>{wh.name}</p>
                           <p className="text-[10px]">Місткість: {wh.capacity}, Оренда: ${wh.dailyCost}/день</p>
                        </div>
                        <PixelButton onClick={() => onRentWarehouse(wh)} disabled={player.warehouses.length >= currentStructure.warehouseLimit}>
                            Орендувати
                        </PixelButton>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderEmployees = () => (
        <div>
            <h4 className="font-bold mb-2">Ваша команда ({player.employees.length}/{currentStructure.employeeLimit}):</h4>
             <div className="space-y-2 mb-4">
                {player.employees.length > 0 ? player.employees.map(emp => (
                     <div key={emp.id} className="bg-gray-100 p-2 border border-black flex justify-between items-center">
                         <div>
                            <p>{emp.name} - <span className="font-semibold">{emp.skill}</span></p>
                            <p className="text-[10px]">З/П: ${emp.salary}/день, Бонус: +{emp.efficiencyBonus * 100}%, Лояльність: {(emp.loyalty * 100).toFixed(0)}%</p>
                         </div>
                         <PixelButton onClick={() => onFireEmployee(emp.id)} className="bg-red-400 hover:bg-red-500">Звільнити</PixelButton>
                     </div>
                )) : <p className="text-xs text-gray-600">У вас поки немає співробітників.</p>}
             </div>

             <h4 className="font-bold mb-2">Кандидати на ринку:</h4>
             <div className="space-y-2 mb-4">
                {availableEmployees.map(emp => (
                     <div key={emp.id} className="bg-gray-100 p-2 border border-black flex justify-between items-center">
                          <div>
                            <p>{emp.name} - <span className="font-semibold">{emp.skill}</span></p>
                            <p className="text-[10px]">З/П: ${emp.salary}/день, Вартість найму: ${emp.salary * 5}</p>
                         </div>
                         <PixelButton onClick={() => onHireEmployee(emp, 'pool')} disabled={player.employees.length >= currentStructure.employeeLimit}>Найняти</PixelButton>
                     </div>
                ))}
             </div>

              <h4 className="font-bold mb-2">Співробітники конкурентів (переманювання):</h4>
             <div className="space-y-2">
                {allCompetitorEmployees.map(emp => (
                     <div key={emp.id} className="bg-gray-100 p-2 border border-black flex justify-between items-center">
                          <div>
                            <p>{emp.name} ({emp.competitorName}) - <span className="font-semibold">{emp.skill}</span></p>
                            <p className="text-[10px]">Ціна переманювання: ${emp.salary * 15}, Шанс успіху: {(100 - emp.loyalty * 100).toFixed(0)}%</p>
                         </div>
                         <PixelButton onClick={() => onHireEmployee(emp, 'competitor', emp.competitorName)} disabled={player.employees.length >= currentStructure.employeeLimit} title="Високий ризик!">Переманити</PixelButton>
                     </div>
                ))}
             </div>
        </div>
    );
    
    const renderStructure = () => {
        const nextStructureId = Object.keys(companyStructures).find((_, i, arr) => arr[i-1] === player.companyStructure) as CompanyStructureId | undefined;
        const nextStructure = nextStructureId ? companyStructures[nextStructureId] : null;

        return (
             <div>
                <h4 className="font-bold mb-2">Поточна структура:</h4>
                <div className="bg-yellow-100 p-3 border-2 border-black mb-6">
                    <h5 className="font-bold text-base">{currentStructure.name}</h5>
                    <p className="text-xs">{currentStructure.description}</p>
                    <ul className="text-xs list-disc list-inside mt-1">
                        <li>Ліміт співробітників: {currentStructure.employeeLimit}</li>
                        <li>Ліміт складів: {currentStructure.warehouseLimit}</li>
                    </ul>
                </div>
                 {nextStructure ? (
                    <>
                        <h4 className="font-bold mb-2">Наступний рівень:</h4>
                        <div className="bg-gray-100 p-3 border-2 border-black flex justify-between items-center">
                            <div>
                                <h5 className="font-bold text-base">{nextStructure.name}</h5>
                                <p className="text-xs">{nextStructure.description}</p>
                                <p className="text-xs mt-1">Вимоги: ${nextStructure.upgradeReq.money} та {nextStructure.upgradeReq.marketShare}% частки ринку.</p>
                                <p className="text-xs">Вартість: ${nextStructure.upgradeCost}</p>
                            </div>
                            <PixelButton 
                                onClick={() => onUpgradeStructure(nextStructure)} 
                                disabled={player.money < nextStructure.upgradeCost || gameState.market.playerShare < (nextStructure.upgradeReq.marketShare ?? 0)}
                                className="bg-green-400 hover:bg-green-500"
                            >
                                Реструктуризація
                            </PixelButton>
                        </div>
                    </>
                 ) : (
                    <p className="text-center font-bold">Ви досягли максимального рівня компанії!</p>
                 )}
             </div>
        )
    };

    const renderOrgChart = () => (
        <div className="org-chart-container">
            <p className="text-xs text-gray-600 mb-2">Розподіліть найнятих співробітників по відділах. Двічі клацніть по назві, щоб редагувати.</p>
            {orgChart && <OrgChartDisplay chartData={orgChart} employees={player.employees} onUpdateChart={onUpdateOrgChart} />}
        </div>
    );
    

    return (
        <Modal title="Управління Компанією" isOpen={isOpen} onClose={onClose}>
            <div className="flex gap-2 border-b-2 border-black pb-2 mb-2">
                <PixelButton onClick={() => setView('employees')} className={view === 'employees' ? 'bg-yellow-300' : ''}>Співробітники</PixelButton>
                <PixelButton onClick={() => setView('warehouses')} className={view === 'warehouses' ? 'bg-yellow-300' : ''}>Склади</PixelButton>
                <PixelButton onClick={() => setView('structure')} className={view === 'structure' ? 'bg-yellow-300' : ''}>Структура</PixelButton>
                <PixelButton onClick={() => setView('orgchart')} className={view === 'orgchart' ? 'bg-yellow-300' : ''}>Орг. структура</PixelButton>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2 pl-4">
                {view === 'warehouses' && renderWarehouses()}
                {view === 'employees' && renderEmployees()}
                {view === 'structure' && renderStructure()}
                {view === 'orgchart' && renderOrgChart()}
            </div>
        </Modal>
    );
};

export default ManagementModal;