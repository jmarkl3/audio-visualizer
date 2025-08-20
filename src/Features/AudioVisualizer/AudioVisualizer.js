import React, { useState } from 'react'
import { Button, Upload } from "antd"
import { UploadOutlined } from '@ant-design/icons';
import "./AudioVisualizer.css"

export default function AudioVisualizer() {

    const [audioUrl, setAudioUrl] = useState()

    function processFile(file){
        if(!file) return

        // Create a local URL for the file
        const url = URL.createObjectURL(file);
        setAudioUrl(url);

        // Not actually uploading the file
        return false;
    }

    return (
        <div className='audioVisualizerContainer'>
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
            <div style={{marginTop: "10px"}}>
                <audio controls src={audioUrl}/>
            </div>

        </div>
    )
}