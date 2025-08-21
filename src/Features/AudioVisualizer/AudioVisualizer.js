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
    const [recieveGridData, setRecieveGridData] = useState()
    const audioRef = useRef()

    
    // Custom hook keeps an up to date grid (refreshing about 60 times/second)
    const { gridData: generagedGridData } = useGridGenerator(audioRef);
    
    const { send, request, socket, isConnected } = useSocket('http://localhost:8080', sendGridData || recieveGridData);

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
    

    useEffect(() => {
    //    console.log("new grid data: ", gridData)
       setGridData(generagedGridData)
    }, [generagedGridData])

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
                        <div className='switchBox'>
                            <Switch 
                                checked={sendGridData} 
                                onChange={newState => {
                                    setSendGridData(newState)
                                    if(newState)
                                        setRecieveGridData(false)
                                }}                            ></Switch>
                            {sendGridData ? "Sending...":"Send"}
                        </div>
                        <div className='switchBox'>
                            <Switch 
                                checked={recieveGridData} 
                                onChange={newState => {
                                    setRecieveGridData(newState)
                                    if(newState)
                                        setSendGridData(false)
                                }}
                            ></Switch>
                            {recieveGridData ? "receiving...":"receive"}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}