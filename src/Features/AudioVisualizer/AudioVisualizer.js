import React, { useEffect, useRef, useState } from 'react'
import { Button, Switch, Upload } from "antd"
import { UploadOutlined } from '@ant-design/icons';
import "./AudioVisualizer.css"
import GridSimulatorWAS from "./GridSimulatorWAS.js"
import GridSimulator from "./GridSimulator.js"
import AudioSync from "./AudioSync.js"
import { useGridGenerator } from './Hooks/useGridGenerator.js';

export default function AudioVisualizer() {

    const [audioUrl, setAudioUrl] = useState()
    const [audioName, setAudioName] = useState()
    const [gridData, setGridData] = useState()
    const [sendGridData, setSendGridData] = useState()
    const [recieveGridData, setRecieveGridData] = useState()
    const audioRef = useRef()

    // Custom hook keeps an up to date grid (refreshing about 60 times/second)
    const { getGrid } = useGridGenerator(audioRef);

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

    // Sets up an interval to update the grid state with getGrid 
    useEffect(() => {
        const interval = setInterval(() => {
            // Get the current version of the grid
            const currentGrid = getGrid();
            // Put in state to display locally
            setGridData(currentGrid);
            // TODO: update express
            // Want to be able to switch sending or receiving to sync between instances
        }, 50); // Update 20 times per second

        return () => clearInterval(interval);
    }, [])

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
                            <Switch checked={sendGridData} onChange={setSendGridData}></Switch>
                            {sendGridData ? "Sending...":"Send"}
                        </div>
                        <div className='switchBox'>
                            <Switch checked={recieveGridData} onChange={setRecieveGridData}></Switch>
                            {recieveGridData ? "receiving...":"receive"}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}