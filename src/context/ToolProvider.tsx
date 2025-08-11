import { createContext, useContext, useRef, useState } from 'react';
import { AvailableTools, type Points } from '../types';

interface ToolsProviderProp {
    children: React.ReactNode;
}

interface ToolsContextType {
    selectedStrokeColor: number;
    setSelectedStrokeColor: React.Dispatch<React.SetStateAction<number>>;

    selectedBackgroundColor: number;
    setSelectedBackgroundColor: React.Dispatch<React.SetStateAction<number>>;

    selectedStrokeWidth: number;
    setSelectedStrokeWidth: React.Dispatch<React.SetStateAction<number>>;

    selectedStrokeStyle: number;
    setSelectedStrokeStyle: React.Dispatch<React.SetStateAction<number>>;

    selectedEdges: number;
    setSelectedEdges: React.Dispatch<React.SetStateAction<number>>;

    selectedTool: AvailableTools;
    setSelectedTool: React.Dispatch<React.SetStateAction<AvailableTools>>;

    currentPoints: React.RefObject<Points[]>;
}

const ToolsContext = createContext<ToolsContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useTools = () => {
    const context = useContext(ToolsContext);
    if (!context) {
        throw new Error('Tools must be use in Tools provider');
    }
    return context;
};

export const ToolsProvider: React.FC<ToolsProviderProp> = ({ children }) => {
    const currentPoints = useRef<Points[]>([]);
    const [selectedStrokeColor, setSelectedStrokeColor] = useState(0);
    const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(0);
    const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(0);
    const [selectedStrokeStyle, setSelectedStrokeStyle] = useState(0);
    const [selectedEdges, setSelectedEdges] = useState(1);
    const [selectedTool, setSelectedTool] = useState<AvailableTools>(AvailableTools.Selection);

    const value: ToolsContextType = {
        selectedStrokeColor,
        setSelectedStrokeColor,
        selectedBackgroundColor,
        setSelectedBackgroundColor,
        selectedStrokeWidth,
        setSelectedStrokeWidth,
        selectedStrokeStyle,
        setSelectedStrokeStyle,
        selectedEdges,
        setSelectedEdges,
        selectedTool,
        setSelectedTool,
        currentPoints,
    };

    return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>;
};
