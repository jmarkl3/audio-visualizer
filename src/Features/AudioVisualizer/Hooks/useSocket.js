import { useEffect, useRef, useState } from 'react'
import io from 'socket.io-client'

const useSocket = (url, active = false, verbose = false) => {
    const socketRef = useRef(null)
    // State for useEffect updates and ref to prevent stale state conditions
    const [isConnected, setIsConnectedState] = useState(false)
    const isConnectedRef = useRef()
    const setIsConnected = (newValue) => {
        setIsConnectedState(newValue)
        isConnectedRef.current = newValue
    }
    
    // Logging if necessary 
    const logIfV = (toLog) => {
        if(verbose)
            console.log(toLog)
    }

    // If the url or active state changes open or close the socket
    useEffect(() => {
        // If it is not active close the socket
        if (!active) {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
                setIsConnected(false)
                logIfV("!active: Closed socket")
            }
            return
        }

        // Create a socket
        const newSocket = io(url, {
            autoConnect: true,
            reconnection: true,
        })

        // Update isConnected on connect or disconnect
        newSocket.on('connect', () => setIsConnected(true))
        newSocket.on('disconnect', () => setIsConnected(false))

        // Keep a ref of the socket
        socketRef.current = newSocket
        logIfV("Created and saved socket ", newSocket)

        // Cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
                logIfV("Closed socket")
            }
            setIsConnected(false)
        }
    }, [active, url])

    // Sending data 
    const send = (data, event = 'update-data') => {
        // If there is a connected socket emit the data
        if (socketRef.current && isConnectedRef.current) {
            socketRef.current.emit(event, data)
        } else {
            console.warn('Socket not connected cannot send data.', "socket: ", socketRef.current, "isConnected: ", isConnected)
        }
    }

    // If requesting data manually
    const request = (data, event = 'request', timeout = 5000) => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current || !isConnectedRef.current) {
                return reject(new Error('Socket not connected.'))
            }

            const timer = setTimeout(() => reject(new Error('Request timeout.')), timeout)

            socketRef.current.emit(event, data, (response) => {
                clearTimeout(timer)
                resolve(response)
            })
        })
    }

    return { socket: socketRef.current, send, request, isConnected }
}

export default useSocket