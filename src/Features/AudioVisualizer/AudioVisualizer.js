import React, { useEffect, useRef, useState } from 'react'
import { Button, Switch, Upload } from "antd"
import { UploadOutlined, DesktopOutlined } from '@ant-design/icons'
import axios from 'axios'
import "./AudioVisualizer.css"
import useSocket from './Hooks/useSocket.js'
import { useGridGenerator } from './Hooks/useGridGenerator.js'
import { useGridGenerator8x12 } from './Hooks/useGridGenerator8x12.js'
import GridSimulator from "./GridSimulators/GridSimulator.js"
import GridSimulator8x12 from './GridSimulators/GridSimulator8x12.js'

export default function AudioVisualizer() {

    // The url to connect to 
    // const apiUrl = "https://audio-visualizer-api.onrender.com"
    const apiUrl = 'http://localhost:8080'
    // Url generated on upload
    const [audioUrl, setAudioUrl] = useState()
    // Name for display
    const [audioName, setAudioName] = useState()
    const [audioPlaying, setAudioPlaying] = useState()
    // Grid data for display
    const [gridData, setGridData] = useState()
    // Maintaining state for rendering and a ref for useEffect
    const [sendGridData, setSendGridDataState] = useState()
    const sendGridDataRef = useRef()
    const setSendGridData = (newValue) => {
        setSendGridDataState(newValue)
        sendGridDataRef.current = newValue
    }
    // Receive state and ref 
    const [receiveGridData, setReceiveGridDataState] = useState()
    const receiveGridDataRef = useRef()
    const setReceiveGridData = (newValue) => {
        setReceiveGridDataState(newValue)
        receiveGridDataRef.current = newValue
    }
    // Ref to the audio player
    const audioRef = useRef()

    // This hook maintains an up to date grid (refreshing about 60 times/second)
    // const { getGrid } = useGridGenerator(audioRef) // RGB version
    const { getGrid } = useGridGenerator8x12(audioRef)
    // This hook maintains a Socket.io connection 
    const { send, socket, isConnected: socketIsConnected } = useSocket(apiUrl, sendGridData || receiveGridData)

    // Upload processing
    function processFile(file){
        if(!file) return

        // Save the name
        setAudioName(file?.name)
        // Create a local URL for the file
        const url = URL.createObjectURL(file)
        setAudioUrl(url)

        // Not actually uploading the file
        return false
    }

    // Local state and sending: Updating grid (Interval polling method)
    useEffect(() => {

        // Ping the api so it spins up (free tier web service hosting)
        axios.get(`${apiUrl}/ping`)
            .then(res => console.log("API Ping Response: ", res))
            .catch(err => console.log("API Ping Error: ", err))
        
        let interval
        if(audioPlaying){
            // Interval polling the grid data
            interval = setInterval(() => {
                // When not in receive mode
                if(!receiveGridDataRef.current){
    
                    // Get the current grid ref value
                    const newGrid = getGrid()
                    
                    // Update local state
                    setGridData(newGrid)
                    
                    // If send is on send the data via the socket
                    if(sendGridDataRef.current)
                        send(newGrid, "update-grid-8x12")
                }
            }, 50) 
        }
        return () => {
            if(interval)
                clearInterval(interval)
        }
    }, [audioPlaying])

    // For receiving: When receiveGridData or the socket changes listen for updates
    useEffect(() => {

        // Callback function so it can be removed in cleanup
        const handleUpdate = (newGrid) => setGridData(newGrid)
      
        // If there is a socket and receiveGridData is on create a listener
        if (socket && socketIsConnected && receiveGridData) {
          socket.on('update-grid', handleUpdate)
        }
      
        // On re-run (socket connection or receiveGridData change) cleanup the listener
        return () => {
          if (socket) {
            socket.off('update-grid', handleUpdate)
          }
        }
    }, [socketIsConnected, receiveGridData])

    return (
        <div className='audioVisualizerContainer'>
            
            {/* Title and uploader */}
            <div className={"titleBox"}>

                {/* Title */}
                <h3>Audio Visualizer</h3>

                {/* Uploader */}
                <div className='uploader'>
                    <Upload
                        beforeUpload={processFile}
                        accept="audio/*"
                        showUploadList={false}
                    >
                        <Button icon={<UploadOutlined/>}>Upload</Button>
                    </Upload>
                </div>
                
            </div>

            {/* Display */}
            <GridSimulator8x12 gridData={gridData} useHeightBasedColor></GridSimulator8x12>

            {/* Audio Player */}
            <div className='audioControllerContainer'>
                <div className='audioControllerBox'>
                   
                    {/* Name of loaded audio file */}
                    <div style={{marginBottom: "10px"}}>{audioName}</div>
                    
                    {/* Audio controller */}
                    <audio 
                        controls 
                        src={audioUrl} 
                        ref={audioRef}
                        onPlay={()=>setAudioPlaying(true)}
                        onPause={()=>setAudioPlaying(false)}
                        onEnded={()=>setAudioPlaying(false)}
                    />
                    
                    {/* Switches */}
                    <div className='switchesBox'>

                        {/* Send switch */}
                        <div className='switchBox'>
                            <Switch 
                                checked={sendGridData} 
                                onChange={newState => {
                                    setSendGridData(newState)
                                    if(newState)
                                        setReceiveGridData(false)
                                }}                            ></Switch>
                            {sendGridData ? "Sending...":"Send"}
                        </div>

                        {/* Receive switch */}
                        <div className='switchBox'>
                            <Switch 
                                checked={receiveGridData} 
                                onChange={newState => {
                                    setReceiveGridData(newState)
                                    if(newState)
                                        setSendGridData(false)
                                }}
                            ></Switch>
                            {receiveGridData ? "receiving...":"receive"}
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}