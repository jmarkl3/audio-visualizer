// src/hooks/useSocket.js
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const useSocket = (url, active = false) => {
    const socketRef = useRef(null);
    // State for useEffect updates and ref to prevent stale state conditions
    const [isConnected, setIsConnectedState] = useState(false);
    const isConnectedRef = useRef()
    const setIsConnected = (newValue) => {
        setIsConnectedState(newValue)
        isConnectedRef.current = newValue
    }

    useEffect(() => {
        if (!active) {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            console.log("!active: closed socket");
        }
        return;
        }

        const newSocket = io(url, {
        autoConnect: true,
        reconnection: true,
        });
        console.log("created socket");

        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));

        socketRef.current = newSocket;
        console.log("saved socket");

        return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            console.log("closed socket");
            socketRef.current = null;
        }
        setIsConnected(false);
        };
    }, [active, url]);

    const send = (data, event = 'message') => {
        if (socketRef.current && isConnectedRef.current) {
            console.log("socket connected, emiting")
            socketRef.current.emit(event, data);
        } else {
            console.warn('Socket not connected; cannot send data.', "socket: ", socketRef.current, "isConnected: ", isConnected);
        }
    };

    const request = (data, event = 'request', timeout = 5000) => {
        return new Promise((resolve, reject) => {
        if (!socketRef.current || !isConnectedRef.current) {
            return reject(new Error('Socket not connected.'));
        }

        const timer = setTimeout(() => reject(new Error('Request timeout.')), timeout);

        socketRef.current.emit(event, data, (response) => {
            clearTimeout(timer);
            resolve(response);
        });
        });
    };

    return { socket: socketRef.current, send, request, isConnected };
};

export default useSocket;