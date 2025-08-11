import React, { createContext, useContext, useRef, useState } from 'react';
import type { Shape } from '../types';
import type { CursorType } from '../components/Canvas';

interface CanvasProviderProp {
    children: React.ReactNode;
}

interface CanvasContextType {
    scale: number;
    setScale: React.Dispatch<React.SetStateAction<number>>;

    shapes: Shape[];
    setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;

    selectedShape: Shape | null;
    setSelectedShape: React.Dispatch<React.SetStateAction<Shape | null>>;

    start: React.RefObject<{ x: number; y: number }>;

    selectedBorderBounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;

    setSelectedBorderBounds: React.Dispatch<
        React.SetStateAction<{ x: number; y: number; width: number; height: number } | null>
    >;

    resizeDirection: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;

    setResizeDirection: React.Dispatch<
        React.SetStateAction<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>
    >;

    cursor: CursorType;
    setCursor: React.Dispatch<CursorType>;

    isPanning: boolean;
    setIsPanning: React.Dispatch<boolean>;

    panOffset: { x: number; y: number };
    setPanOffset: React.Dispatch<{ x: number; y: number }>;

    startPan: { x: number; y: number };
    setStartPan: React.Dispatch<{ x: number; y: number }>;

    isDrawing: React.RefObject<boolean>;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCanvas = () => {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error('Canvas must be use in Canvas provider');
    }
    return context;
};

export const CanvasProvider: React.FC<CanvasProviderProp> = ({ children }) => {
    const start = useRef({ x: 0, y: 0 });
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedBorderBounds, setSelectedBorderBounds] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
    const [resizeDirection, setResizeDirection] = useState<
        'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null
    >(null);

    const [cursor, setCursor] = useState<CursorType>('default');
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const isDrawing = useRef(false);

    const value: CanvasContextType = {
        isDrawing,
        scale,
        setScale,
        start,
        shapes,
        setShapes,
        selectedShape,
        setSelectedShape,
        selectedBorderBounds,
        setSelectedBorderBounds,
        resizeDirection,
        setResizeDirection,
        cursor,
        setCursor,
        isPanning,
        setIsPanning,
        panOffset,
        setPanOffset,
        startPan,
        setStartPan,
    };

    return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};
