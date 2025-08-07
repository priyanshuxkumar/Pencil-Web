/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react';
import { removeLocalStorage } from '../utils/localStorage';

const WS_URL = 'ws://localhost:8080';

export const useSocket = () => {
    const socketRef = useRef<WebSocket | null>(null);
    const [message, setMessage] = useState<any>();
    const [isConnected, setIsConnected] = useState(false);

    const connect = () => {
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

            // remove userid and username from local storage
            removeLocalStorage('user_name')
            removeLocalStorage('user_id')
        };

        socket.onerror = (err) => {
            console.log('socket error occurred', err);
        };
    };

    const disconnect = () => {
        socketRef.current?.close();            
    }

    return { socketRef, message: message, isConnected, connect, disconnect };
};
