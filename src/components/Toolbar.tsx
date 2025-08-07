import { Hand, MousePointer, Square, Diamond, Circle, ArrowRight, Minus, Edit2, Type, Bot } from 'lucide-react';
import type React from 'react';
import { AvailableTools } from '../types';

const toolbarItems = [
    { name: 'ai', icon: Bot, title: 'AI' },
    { name: 'hand', icon: Hand, title: 'Hand' },
    { name: 'selection', icon: MousePointer, title: 'Selection' },
    { name: 'rectangle', icon: Square, title: 'Rectangle' },
    { name: 'ellipse', icon: Circle, title: 'Ellipse' },
    { name: 'pen', icon: Edit2, title: 'Pen' },
    { name: 'diamond', icon: Diamond, title: 'Diamond' },
    { name: 'arrow', icon: ArrowRight, title: 'Arrow' },
    { name: 'line', icon: Minus, title: 'Line' },
    { name: 'text', icon: Type, title: 'Text' },
];

interface Toolbar {
    selectedTool: string;
    handleSelectTool: (toolName: AvailableTools) => void;
}

const Toolbar: React.FC<Toolbar> = ({ selectedTool, handleSelectTool }) => {
    return (
        <div className="flex justify-center w-full items-center bg-transparent">
            <div className="space-y-2">
                <div className="flex items-center gap-1 p-1 relative bg-neutral-100 border border-gray-200 rounded-2xl transition-all duration-200 max-w-fit mx-auto shadow-lg">
                    <div className="flex flex-col items-center gap-1">
                        {toolbarItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => handleSelectTool(item.name as AvailableTools)}
                                className={`
                                relative flex items-center justify-center w-10 h-10 rounded-lg
                                text-sm font-medium transition-all duration-200
                                    ${
                                        selectedTool === item.name
                                            ? 'bg-[#004030] text-white shadow-md'
                                            : 'text-gray-800 hover:bg-gray-700 hover:text-white'
                                    }
                                `}
                                title={item.title}
                            >
                                <item.icon size={15} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
