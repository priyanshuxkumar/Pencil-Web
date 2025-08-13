import { createContext, useContext } from 'react';
import type { CanvasContextType } from '../context/CanvasProvider';

export const CanvasContext = createContext<CanvasContextType | null>(null);

export const useCanvas = () => {
    const context = useContext(CanvasContext);
    if (!context) {
        throw new Error('Canvas must be use in Canvas provider');
    }
    return context;
};
