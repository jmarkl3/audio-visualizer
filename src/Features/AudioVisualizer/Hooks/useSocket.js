// src/hooks/useSocket.js
// Custom React hook for managing a Socket.io connection.
// It connects/disconnects based on an 'active' flag (e.g., tied to a checkbox).
// Returns an object with methods: send (to emit data), request (for request-response via acknowledgments),
// and the socket instance for advanced use (e.g., socket.on for listening).
// Requires socket.io-client installed: npm install socket.io-client
// On the server side (Express), use socket.io to handle emits and acks.

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = (url, active = false) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!active) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create a new socket with the given url
    const newSocket = io(url, {
      autoConnect: true,
      reconnection: true, // Automatic reconnection if disconnected.
    });

    // Update isConnected state based on connect and disconnect events
    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    // Put the new socket in state for hook access
    setSocket(newSocket);

    // Cleanup: Disconnect on unmount or when active changes to false.
    return () => {
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, [active, url]);

  // Send data via emit (default event: 'message'; can specify custom event).
  const send = (data, event = 'message') => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected; cannot send data.');
    }
  };

  // Request-response pattern using Socket.io acknowledgments.
  // Sends data and returns a Promise that resolves with the server's response.
  // Server must handle with socket.on('request', (data, ack) => { ack(response); });
  const request = (data, event = 'request', timeout = 5000) => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        return reject(new Error('Socket not connected.'));
      }

      const timer = setTimeout(() => reject(new Error('Request timeout.')), timeout);

      socket.emit(event, data, (response) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  };

  return { socket, send, request, isConnected };
};

export default useSocket;