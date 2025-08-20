import React, { useRef, useState } from 'react'
import { Button, Upload } from "antd"
import { UploadOutlined } from '@ant-design/icons';
import "./AudioVisualizer.css"
import GridSimulator from "./GridSimulator.js"

export default function AudioVisualizer() {

    const [audioUrl, setAudioUrl] = useState()
    const [audioName, setAudioName] = useState()
    const audioRef = useRef()

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
            <GridSimulator audioRef={audioRef}></GridSimulator>
            
            {/* Audio Player */}
            <div className='audioControllerBox'>
                <div style={{marginBottom: "10px"}}>{audioName}</div>
                <audio controls src={audioUrl} ref={audioRef}/>
            </div>

        </div>
    )
}