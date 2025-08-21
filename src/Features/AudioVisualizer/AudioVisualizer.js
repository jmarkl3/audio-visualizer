import React, { useEffect, useRef, useState } from 'react'
import { Button, Switch, Upload } from "antd"
import { UploadOutlined } from '@ant-design/icons';
import "./AudioVisualizer.css"
import GridSimulatorWAS from "./GridSimulatorWAS.js"
import GridSimulator from "./GridSimulator.js"
import AudioSync from "./AudioSync.js"
import { useGridGenerator } from './Hooks/useGridGenerator.js';
import useSocket from './Hooks/useSocket.js';

export default function AudioVisualizer() {

    const [audioUrl, setAudioUrl] = useState()
    const [audioName, setAudioName] = useState()
    const [gridData, setGridData] = useState()
    const [sendGridData, setSendGridData] = useState()
    const [receiveGridData, setReceiveGridData] = useState()
    const audioRef = useRef()

    
    // Custom hook keeps an up to date grid (refreshing about 60 times/second)
    const { gridData: generagedGridData } = useGridGenerator(audioRef);
    
    const { send, request, socket, isConnected } = useSocket('http://localhost:8080', sendGridData || receiveGridData);

    function processFile(file){
        if(!file) return

        // Save the name
        setAudioName(file?.name)
        // Create a local URL for the file
        const url = URL.createObjectURL(file);
        setAudioUrl(url);

        // Not actually uploading the file
        return false;
    }
   
    // When the generagedGridData updates update the local state and send (if sending is on)  
    useEffect(() => {
        
        //console.log("new grid data: ", gridData)
       
        // When not receiving we want to update state and if sending send
        if(!receiveGridData){

            // Update local state
            setGridData(generagedGridData)
            
            // If send is on send the data via the socket
            if(sendGridData)
                send(generagedGridData)
        }
        
    }, [generagedGridData])

    // When receiveGridData or the socket changes listen for updates
    useEffect(() => {

        // Callback function so it can be removed in cleanup
        const handleUpdate = (newGrid) => setGridData(newGrid);
      
        // If there is a socket and receiveGridData is on create a listener
        if (socket && receiveGridData) {
          socket.on('update-grid', handleUpdate);
        }
      
        // On rerun (socket or receiveGridData change) cleanup the listener
        return () => {
          if (socket) {
            socket.off('update-grid', handleUpdate);
          }
        };
    }, [socket, receiveGridData]);


    // Interval method
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //     }, 50); // Update 20 times per second
    //     return () => clearInterval(interval);
    // }, [])

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
            <GridSimulator gridData={gridData}></GridSimulator>

            {/* Audio Player */}
            <div className='audioControllerContainer'>
                <div className='audioControllerBox'>
                   
                    {/* Loaded song name */}
                    <div style={{marginBottom: "10px"}}>{audioName}</div>
                    
                    {/* Audio controller */}
                    <audio controls src={audioUrl} ref={audioRef}/>
                    
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