import React from 'react';
// FIX: Corrected import to use CompetitorSWOT type.
import { CompetitorSWOT, SWOTAnalysis } from '../types';
import ManualSwotEditor from './ManualSwotEditor';

interface ManualCompetitorSwotEditorProps {
    compSwotData: CompetitorSWOT;
    setCompSwotData: React.Dispatch<React.SetStateAction<CompetitorSWOT | null>>;
}

const ManualCompetitorSwotEditor: React.FC<ManualCompetitorSwotEditorProps> = ({ compSwotData, setCompSwotData }) => {

    // This creates a dedicated setter for each competitor's SWOT object
    const createPerCompetitorSetter = (competitorName: string): React.Dispatch<React.SetStateAction<SWOTAnalysis | null>> => {
        return (updater) => {
            setCompSwotData(prevCompSwot => {
                if (!prevCompSwot) return null;

                const oldSwotForCompetitor = prevCompSwot[competitorName] || null;
                const newSwotForCompetitor = typeof updater === 'function' 
                    ? updater(oldSwotForCompetitor) 
                    : updater;

                if (newSwotForCompetitor === null) {
                    // For now, let's just not update if a SWOT becomes null.
                    return prevCompSwot;
                }
                
                return {
                    ...prevCompSwot,
                    [competitorName]: newSwotForCompetitor
                };
            });
        };
    };

    return (
        <div className="space-y-6">
            {Object.entries(compSwotData).map(([name, data]) => (
                <div key={name}>
                    <h3 className="font-bold text-base mb-2">{name}</h3>
                    <ManualSwotEditor
                        swotData={data}
                        setSwotData={createPerCompetitorSetter(name)}
                    />
                </div>
            ))}
        </div>
    );
};

export default ManualCompetitorSwotEditor;