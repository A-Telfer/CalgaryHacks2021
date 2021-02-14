import React from 'react';
import Board from '../board/Board';
import io from 'socket.io-client';

import * as faceapi from 'face-api.js';
import './style.css';

class Container extends React.Component {
    constructor(props) {
        super(props);

        this.videoRef = React.createRef();
        this.state = {
            color: "#000000",
            size: "5",
            socket: undefined
        }
    }

    changeColor(params) {
        this.setState({
            color: params.target.value
        })
    }

    changeSize(params) {
        this.setState({
            size: params.target.value
        })
    }

    async loadModel() {
        await faceapi.nets.tinyFaceDetector.loadFromUri('http://localhost:3001/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('http://localhost:3001/models')
        await faceapi.nets.faceRecognitionNet.loadFromUri('http://localhost:3001/models')
        await faceapi.nets.faceExpressionNet.loadFromUri('http://localhost:3001/models')
        console.log('Models loaded')
    }

    async getDetection() {
        let video = this.videoRef.current;
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

        if (detections.length > 0) {
            if (this.state.socket) {
                this.state.socket.emit('emotion', JSON.stringify(detections[0].expressions));
            }
        }
    }

    async connectSocket() {
        let socket = await io.connect("http://localhost:3001");
        this.setState({ socket: socket })
        socket.on('connect', () => {
            console.log('socket connected')
        })

        socket.on('emotion', (data) => {
            let emotion_data = JSON.parse(data);
            console.log('emotion_data', data)
        })
    }

    getVideo() {
        this.connectSocket()
        this.loadModel().then(() => {
            navigator.mediaDevices
                .getUserMedia({ video: { width: 300 } })
                .then((stream) => {
                    let video = this.videoRef.current;
                    video.srcObject = stream;
                    video.play();
                    setInterval(this.getDetection.bind(this), 500)
                })
                .catch(err => {
                    console.error("error:", err);
                });
        });
    };




    render() {

        return (
            <div className="container">
                <div class="tools-section">
                    <div className="color-picker-container">
                        Select Brush Color : &nbsp;
                        <input type="color" value={this.state.color} onChange={this.changeColor.bind(this)} />
                    </div>

                    <div className="brushsize-container">
                        Select Brush Size : &nbsp;
                        <select value={this.state.size} onChange={this.changeSize.bind(this)}>
                            <option> 5 </option>
                            <option> 10 </option>
                            <option> 15 </option>
                            <option> 20 </option>
                            <option> 25 </option>
                            <option> 30 </option>
                        </select>
                    </div>

                    <div className="start-webcam-button">
                        <button onClick={() => this.getVideo()}>Start webcam</button>
                    </div>
                </div>
                <div style={{ display: 'flex', height: '100%    ' }}>
                    <div style={{
                        flex: '1',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <div class="board-container">
                            <Board color={this.state.color} size={this.state.size}></Board>
                        </div>
                    </div>
                    <div className="video-container">
                        <video style={{ height: '100%', width: '100%' }} ref={this.videoRef} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Container