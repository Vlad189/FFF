import React, { useState } from 'react';
import { OrgChartNode, Employee } from '../types';

// Helper to find a node in the tree and its parent
const findNodeAndParent = (root: OrgChartNode, nodeId: string): { node: OrgChartNode | null, parent: OrgChartNode | null } => {
    if (root.id === nodeId) {
        return { node: root, parent: null };
    }

    const queue: { node: OrgChartNode, parent: OrgChartNode | null }[] = [{ node: root, parent: null }];

    while (queue.length > 0) {
        const { node, parent } = queue.shift()!;
        for (const child of node.children) {
            if (child.id === nodeId) {
                return { node: child, parent: node };
            }
            queue.push({ node: child, parent: node });
        }
    }
    return { node: null, parent: null };
};

interface NodeComponentProps {
    node: OrgChartNode;
    allEmployees: Employee[];
    onUpdateChart: (newChart: OrgChartNode) => void;
    chartData: OrgChartNode;
    assignedEmployeeIds: Set<string>;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ node, allEmployees, onUpdateChart, chartData, assignedEmployeeIds }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [nodeName, setNodeName] = useState(node.name);
    const isRoot = node.id === 'root';

    const updateNodeInChart = (nodeId: string, updateFn: (node: OrgChartNode) => void) => {
        const newChart = JSON.parse(JSON.stringify(chartData));
        const { node: targetNode } = findNodeAndParent(newChart, nodeId);
        if (targetNode) {
            updateFn(targetNode);
            onUpdateChart(newChart);
        }
    };

    const handleNameChange = () => {
        if (isRoot) return;
        updateNodeInChart(node.id, (n) => { n.name = nodeName; });
        setIsEditingName(false);
    };

    const handleAddEmployee = (employeeId: string) => {
        updateNodeInChart(node.id, (n) => {
            if (!n.employees.includes(employeeId)) {
                n.employees.push(employeeId);
            }
        });
    };
    
    const handleRemoveEmployee = (employeeId: string) => {
        updateNodeInChart(node.id, (n) => {
            n.employees = n.employees.filter(id => id !== employeeId);
        });
    };

    const handleAddChild = () => {
        const newNode: OrgChartNode = {
            id: `node-${Date.now()}`,
            name: 'Новий відділ',
            employees: [],
            children: [],
        };
        updateNodeInChart(node.id, (n) => {
            n.children.push(newNode);
        });
    };

    const handleRemoveNode = () => {
        const newChart = JSON.parse(JSON.stringify(chartData));
        const { parent } = findNodeAndParent(newChart, node.id);
        if (parent) {
            parent.children = parent.children.filter(child => child.id !== node.id);
            onUpdateChart(newChart);
        }
    };

    const nodeEmployees = node.employees.map(id => allEmployees.find(e => e.id === id)).filter(Boolean) as Employee[];
    const unassignedEmployees = allEmployees.filter(e => !assignedEmployeeIds.has(e.id));

    return (
       <div className="org-chart-node-wrapper relative pt-4">
            <div className="bg-gray-200 p-2 border-2 border-black mb-2 relative group w-fit min-w-[200px]">
                {isEditingName && !isRoot ? (
                    <input
                        type="text"
                        value={nodeName}
                        onChange={(e) => setNodeName(e.target.value)}
                        onBlur={handleNameChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
                        autoFocus
                        className="w-full bg-white/80 text-black text-xs outline-none p-1 border border-black"
                    />
                ) : (
                    <h4 
                        className={`font-bold ${!isRoot ? 'cursor-pointer hover:bg-yellow-200' : ''}`} 
                        onDoubleClick={() => !isRoot && setIsEditingName(true)}
                    >
                        {node.name}
                    </h4>
                )}

                {!isRoot && (
                    <div className="text-xs mt-1">
                        <p className="font-semibold">Співробітники ({node.employees.length}):</p>
                        {nodeEmployees.length > 0 ? (
                            <ul className="list-disc list-inside">
                                {nodeEmployees.map(emp => (
                                    <li key={emp.id} className="group/item flex justify-between items-center">
                                        <span>{emp.name} <span className="text-gray-500">({emp.skill})</span></span>
                                        <button onClick={() => handleRemoveEmployee(emp.id)} className="ml-2 text-red-500 opacity-0 group-hover/item:opacity-100">x</button>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500">Немає</p>}
                    </div>
                )}


                <div className="flex flex-wrap gap-2 mt-2">
                     {!isRoot && (
                        <select onChange={(e) => {if(e.target.value) handleAddEmployee(e.target.value)}} value="" className="text-xs bg-white border border-black p-1" disabled={unassignedEmployees.length === 0}>
                            <option value="" disabled>Додати співробітника</option>
                            {unassignedEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                     )}
                    <button onClick={handleAddChild} className="text-xs bg-gray-300 border border-black px-2 py-1 hover:bg-yellow-200" title="Додати підрозділ">+</button>
                </div>
                 {!isRoot && (
                    <button onClick={handleRemoveNode} className="absolute top-1 right-1 text-xs bg-red-300 border border-black px-1 hover:bg-red-400 opacity-0 group-hover:opacity-100" title="Видалити підрозділ">-</button>
                 )}
            </div>

            {node.children && node.children.length > 0 && (
                <ul className="org-chart-node-children pl-5 relative">
                    {node.children.map(child => (
                        <li key={child.id}>
                             <NodeComponent
                                node={child}
                                allEmployees={allEmployees}
                                onUpdateChart={onUpdateChart}
                                chartData={chartData}
                                assignedEmployeeIds={assignedEmployeeIds}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


interface OrgChartDisplayProps {
    chartData: OrgChartNode | null;
    employees: Employee[];
    onUpdateChart: (newChart: OrgChartNode) => void;
}

const OrgChartDisplay: React.FC<OrgChartDisplayProps> = ({ chartData, employees, onUpdateChart }) => {
    if (!chartData) {
        return <p>Організаційна структура не створена.</p>;
    }
    
    const getAllAssignedEmployeeIds = (node: OrgChartNode, set: Set<string>) => {
        node.employees.forEach(id => set.add(id));
        node.children.forEach(child => getAllAssignedEmployeeIds(child, set));
    };

    const assignedEmployeeIds = new Set<string>();
    getAllAssignedEmployeeIds(chartData, assignedEmployeeIds);

    return (
        <NodeComponent
            node={chartData}
            allEmployees={employees}
            onUpdateChart={onUpdateChart}
            chartData={chartData}
            assignedEmployeeIds={assignedEmployeeIds}
        />
    );
};

export default OrgChartDisplay;