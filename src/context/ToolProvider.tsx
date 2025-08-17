import { useRef, useState } from 'react';
import { AvailableTools } from '../types/tools.types';
import type { Points } from '../types/shapes.types';
import { ToolsContext } from '../hook/useTools';
import { useCanvas } from '../hook/useCanvas';

interface ToolsProviderProp {
    children: React.ReactNode;
}

export interface ToolsContextType {
    currentPoints: React.RefObject<Points[]>;

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

    selectionRect: { x: number; y: number; width: number; height: number } | null;
    setSelectionRect: React.Dispatch<{ x: number; y: number; width: number; height: number } | null>;

    handleSelectTool: (toolName: AvailableTools) => void;

    selectedTextSize: string;
    setSelectedTextSize: React.Dispatch<React.SetStateAction<string>>;
}

export const ToolsProvider: React.FC<ToolsProviderProp> = ({ children }) => {
    const currentPoints = useRef<Points[]>([]);
    const [selectedStrokeColor, setSelectedStrokeColor] = useState(0);
    const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(0);
    const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(0);
    const [selectedStrokeStyle, setSelectedStrokeStyle] = useState(0);
    const [selectedEdges, setSelectedEdges] = useState(1);
    const [selectedTool, setSelectedTool] = useState<AvailableTools>(AvailableTools.Selection);
    const [selectionRect, setSelectionRect] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);
    const [selectedTextSize, setSelectedTextSize] = useState<string>('M');
    
    const { setCursor } = useCanvas();

    const handleSelectTool = (toolName: AvailableTools) => {
        setSelectedTool(toolName);

        if (toolName === 'selection') {
            setCursor('default');
        } else if (toolName === 'text') {
            setCursor('text');
        } else {
            setCursor('crosshair');
        }
    };

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
        selectionRect,
        setSelectionRect,
        handleSelectTool,
        selectedTextSize,
        setSelectedTextSize,
    };

    return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>;
};
