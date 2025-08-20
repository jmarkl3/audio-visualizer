import { Button } from 'antd'
import React, { useState } from 'react'
import "./Dev.css"

export default function APITest() {

    const [message, setMessage] = useState()
    // const apiUrl = "https://audio-visualizer-api.onrender.com"
    const apiUrl = "http://localhost:8080/"

    function testAPI(){
        setMessage("Testing API...")
        try{
            fetch(apiUrl)
            .then(res => res.json())
            .then(resJSON => {
                console.log(resJSON)
                setMessage(resJSON?.message)
            })
        }catch(error){
            console.log("Fetch error: ", error)
        }
    }

    return (
        <div className='apiTestBox'>
            <Button onClick={testAPI}>Test API</Button>
            <div style={{marginTop: "10px"}}>
                {message}
            </div>
        </div>
    )
}