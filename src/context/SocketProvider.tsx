import { useCallback, useRef, useState } from 'react';
import { removeLocalStorage } from '../utils/localStorage';
import type { ServerSocketEvent, SocketMessage } from '../types/socket.types';
import { SocketContext } from '../hook/useSocket';

const WS_URL = import.meta.env.VITE_APP_WS_URL!;

interface SocketProviderProp {
    children: React.ReactNode;
}

export interface SocketContextType {
    socketRef: React.RefObject<WebSocket | null>;

    message: ServerSocketEvent | null;

    isConnected: boolean;

    hasJoinedRoom: boolean;

    connect: () => void;

    disconnect: () => void;

    sendMessage: (message: SocketMessage) => void;
}

export const SocketProvider: React.FC<SocketProviderProp> = ({ children }) => {
    const socketRef = useRef<WebSocket | null>(null);
    const [message, setMessage] = useState<ServerSocketEvent | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const hasJoinedRoomRef = useRef(false);

    const connect = useCallback(() => {
        if (socketRef.current) return;

        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('client connected');
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const _message = JSON.parse(event.data);
            setMessage(_message);
        };

        socket.onclose = () => {
            console.log('client disconnected');
            setIsConnected(false);
            hasJoinedRoomRef.current = false;

            // remove userId and username from local storage
            removeLocalStorage('user_name');
            removeLocalStorage('user_id');
        };

        socket.onerror = (err) => {
            console.log('socket error occurred', err);
        };
    }, []);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        hasJoinedRoomRef.current = false;
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((msg: SocketMessage) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        } else {
            console.warn('Socket not connected, cannot send message:', msg);
        }
    }, []);

    const value = {
        socketRef,
        message,
        isConnected,
        connect,
        disconnect,
        sendMessage,
        hasJoinedRoom: hasJoinedRoomRef.current,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
