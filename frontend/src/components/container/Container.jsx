import React from 'react';
import Board from '../board/Board';
import io from 'socket.io-client';

import Emojis from "../emojis/Emojis";

import * as faceapi from 'face-api.js';
import './style.css';

import eraser from './eraser.png'
import pencil from './pencil.png'
import happy from "../emojis/happy.png";
import sad from "../emojis/sad.png";
import sleepy from "../emojis/sleepy.png";
import { calcEAR} from "./eye.helper";

class Container extends React.Component {
    constructor(props) {
        super(props);

        this.videoRef = React.createRef();
        this.state = {
            color: "#000000",
            size: "5",
            prevColor: "#000000",
            prevSize: "5"
            socket: undefined,
            groupEmotions: ['happy', 'neutral', 'sad']
        }
        this.setEraser = this.setEraser.bind(this);
        this.setPencil = this.setPencil.bind(this);
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
 
    setEraser() {
        this.setState({
            prevColor: this.state.color,
            prevSize: this.state.size,
            color: "#ffffff",
            size: "30"
        })
    }

    setPencil() {
        this.setState({
            color: this.state.prevColor,
            size: this.state.prevSize
        })
    }

    async loadModel() {
        await faceapi.nets.tinyFaceDetector.loadFromUri('http://localhost:3001/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri('http://localhost:3001/models')
        await faceapi.nets.faceRecognitionNet.loadFromUri('http://localhost:3001/models')
        await faceapi.nets.faceExpressionNet.loadFromUri('http://localhost:3001/models')
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('http://localhost:3001/models')
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
        const result = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true)

        if (result) {

            const leftEye = result.landmarks.getLeftEye()
            const rightEye = result.landmarks.getRightEye()
            const EAR = calcEAR(leftEye) + calcEAR(rightEye)
            const text = ['EAR: ' + EAR.toString()]
            if (EAR < 50) {
                console.log("ear less than 50", text)
            } else {
                console.log("ear greater than 50", text)
            }

        } else {
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
            this.getGroupEmotionOrder(emotion_data)
        })
    }

    getGroupEmotionOrder(emotion_data) {
        let emotions = {
            neutral: 0,
            happy: 0,
            sad: 0,
            angry: 0,
            fearful: 0,
            disgusted: 0,
            surprised: 0
        }

        emotion_data.forEach((user_emotions) => {
            let keysSorted = Object.keys(user_emotions).sort(function (a, b) { return user_emotions[a] - user_emotions[b] })
            let lastItem = 6
            emotions[keysSorted[lastItem]] = emotions[keysSorted[lastItem]] + 1;
        })

        let keysSorted = Object.keys(emotions).sort(function (a, b) { return emotions[a] - emotions[b] })
        this.setState({ groupEmotions: keysSorted.slice(keysSorted.length - 3).reverse() })
        console.log(emotion_data.length, keysSorted.slice(keysSorted.length - 3).reverse())
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
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
                    <span style={{ fontSize: '40px', fontFamily: 'sans-serif', fontWeight: 'bold' }}>Zoom but better</span>
                    <div style={{ visibility: this.props.role ? 'visible' : 'hidden' }}>
                        <Emojis order={this.state.groupEmotions} />
                    </div>
                </div>
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
                <div className="sidebar" >
                    <img className="image"
                         width="50"
                         height="50"
                         onClick={this.setPencil.bind(this)}
                         src={pencil}
                         alt={pencil}/>
                    <img className="image"
                         width="50"
                         height="50"
                         onClick={this.setEraser.bind(this)}
                         src={eraser}
                         alt={eraser}/>
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
                        <div className="video-container">
                            <video style={{ height: '100%', width: '100%' }} ref={this.videoRef} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Container