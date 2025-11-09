import React, { useState } from 'react';
import { GanttTask } from '../types';

interface GanttChartProps {
    tasks: GanttTask[];
    isEditable?: boolean;
    onUpdateTask?: (taskId: string, newName: string) => void;
    onRemoveTask?: (taskId: string) => void;
    onToggleTaskCompletion?: (taskId: string) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, isEditable = false, onUpdateTask, onRemoveTask, onToggleTaskCompletion }) => {
    const totalDays = 365;
    const quarters = [
        { name: "Квартал 1", days: "1-91" },
        { name: "Квартал 2", days: "92-182" },
        { name: "Квартал 3", days: "183-273" },
        { name: "Квартал 4", days: "274-365" }
    ];
    const colors = ['bg-sky-500', 'bg-teal-500', 'bg-purple-500', 'bg-red-500', 'bg-green-600'];

    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');

    const handleStartEdit = (task: GanttTask) => {
        if (!isEditable) return;
        setEditingTaskId(task.id);
        setEditedName(task.name);
    };

    const handleSaveEdit = (taskId: string) => {
        if (onUpdateTask && editedName.trim()) {
            onUpdateTask(taskId, editedName.trim());
        }
        setEditingTaskId(null);
    };
    
    const handleCancelEdit = () => {
      setEditingTaskId(null);
    };

    return (
        <div>
            <h3 className="font-bold mb-2 text-base">Діаграма Ганта (Річна)</h3>
            <div className="bg-gray-200 border-2 border-black p-2 text-black text-xs">
                {/* Timeline Header */}
                <div className="flex w-full">
                    <div className="w-2/5 shrink-0 border-b-2 border-black font-bold pl-1">ЗАВДАННЯ</div>
                    <div className="w-3/5 flex-grow border-b-2 border-black flex">
                         {quarters.map(q => (
                            <div key={q.name} className="w-1/4 text-center border-l-2 border-black text-[10px] py-1" title={`Дні ${q.days}`}>{q.name}</div>
                        ))}
                    </div>
                </div>

                {/* Task Rows */}
                <div className="space-y-1 mt-2">
                    {tasks.map((task, index) => {
                        const left = (task.startDay / totalDays) * 100;
                        const width = Math.max(((task.endDay - task.startDay) / totalDays) * 100, 0.5);
                        
                        return (
                            <div key={task.id} className="flex items-center min-h-8 w-full">
                                {/* Task Name Column */}
                                <div className="w-2/5 shrink-0 pr-2">
                                    {editingTaskId === task.id ? (
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            onBlur={() => handleSaveEdit(task.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit(task.id);
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                            className="w-full h-full bg-white/80 text-black text-xs outline-none p-1 border border-black"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center group">
                                            {isEditable && onToggleTaskCompletion && (
                                                <input type="checkbox" checked={task.isCompleted} onChange={() => onToggleTaskCompletion(task.id)} className="mr-2 cursor-pointer"/>
                                            )}
                                            <span 
                                                className={`cursor-pointer group-hover:bg-yellow-200 w-full p-1 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}
                                                onDoubleClick={() => handleStartEdit(task)}
                                                title={task.name}
                                            >
                                               {task.name}
                                            </span>
                                             {isEditable && onRemoveTask && (
                                                 <button 
                                                    onClick={() => onRemoveTask(task.id)} 
                                                    className="text-black hover:text-red-700 font-bold text-sm ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Видалити задачу"
                                                 >
                                                    x
                                                 </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Timeline Column */}
                                <div className="w-3/5 flex-grow relative h-full flex">
                                    {/* This new structure replicates the header exactly for perfect alignment */}
                                    {quarters.map((_, i) => (
                                        <div key={i} className="w-1/4 h-full bg-gray-300 border-l-2 border-black" />
                                    ))}
                                    <div
                                        className={`absolute h-5 ${colors[index % colors.length]} border border-black top-1/2 -translate-y-1/2 ${task.isCompleted ? 'opacity-60' : ''}`}
                                        style={{ 
                                            left: `${left}%`, 
                                            width: `${width}%`,
                                        }}
                                        title={`${task.name} (День ${task.startDay} - ${task.endDay})`}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GanttChart;