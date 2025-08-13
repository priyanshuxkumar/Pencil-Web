import { createContext, useContext } from 'react';
import type { SocketContextType } from '../context/SocketProvider';

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('Socket must be use in socket provider');
    }
    return context;
};
