import React from 'react';
import Board from '../board/Board';
import io from 'socket.io-client';

import Emojis from "../emojis/Emojis";

import * as faceapi from 'face-api.js';
import './style.css';
import { calcEAR } from "./eye.helper";
import { HOST } from "../../constants";

import { Button, DropdownButton } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import Form from 'react-bootstrap/Form'
// import { param } from 'jquery';

class Container extends React.Component {
    constructor(props) {
        super(props);

        this.videoRef = React.createRef();
        this.state = {
            color: "#000000",
            size: "5",
            socket: undefined,
            groupEmotions: ['happy', 'neutral', 'sad'],
            earString: '',
            tsEarString: Date.now()
        }
    }

    changeColor(params) {
        this.setState({
            color: params.target.value
        })
    }

    changeSize(size) {
        this.setState({
            size: "" + size
        })
    }

    async loadModel() {
        await faceapi.nets.tinyFaceDetector.loadFromUri(HOST + '/models')
        await faceapi.nets.faceLandmark68Net.loadFromUri(HOST + '/models')
        await faceapi.nets.faceRecognitionNet.loadFromUri(HOST + '/models')
        await faceapi.nets.faceExpressionNet.loadFromUri(HOST + '/models')
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(HOST + '/models')
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
            if (EAR < 45) {
                console.log("ear less than 50", text)
            } else {
                console.log("ear greater than 50", text)
            }

            console.log()

            if ((Date.now() - this.state.tsEarString) > 5000) {
                this.setState({ 
                    earString: EAR < 45 ? "Drowsy 😴😴" : "",
                    tsEarString: Date.now()
                })
            }

        } else {
        }
    }

    async connectSocket() {
        let socket = await io.connect(HOST);
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

        let keysSorted = Object.keys(emotions).sort(function (a, b) { return emotions[b] - emotions[a] })
        this.setState({ groupEmotions: keysSorted.slice(0, 3) })
        console.log(emotion_data.length, keysSorted.slice(0, 3))
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
                    <span style={{ fontSize: '40px', fontFamily: 'sans-serif', fontWeight: 'bold' }}>Emoji Zoom</span>
                    <div style={{ visibility: this.props.role ? 'visible' : 'hidden' }}>
                        <Emojis order={this.state.groupEmotions} />
                    </div>
                </div>
                <div className="container">
                    <div className="tools-section">

                        <div style={{ fontSize: '32px', position: 'fixed', right: 10 }}>
                            { this.state.earString }
                        </div>
                        
                        <div className="color-picker-container">
                            Select Brush Color: &nbsp;
                        <input 
                            // style={{ height: '35px', marginTop: '10px' }}
                            type="color" 
                            value={this.state.color} 
                            onChange={this.changeColor.bind(this)} />
                        </div>

                        <div className="brushsize-container">
                            {/* Select Brush Size : &nbsp; */}
                        <DropdownButton 
                            variant="outline-primary"
                            style={{ display: 'inline' }} 
                            title={`Select Brush Size (${this.state.size})`}
                            // onChange={this.changeSize.bind(this)}
                        >
                            {
                                [5, 10, 15, 20, 25, 30].map(item => 
                                    <Dropdown.Item 
                                        onClick={() => this.changeSize(item)}
                                    >
                                        {item} 
                                    </Dropdown.Item>
                                )
                            }
                            </DropdownButton>
                        </div>
{/* 
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
                        </div> */}

                        <div className="start-webcam-button">
                            <Button 
                                variant="outline-primary" 
                                style={{ borderRadius: '10px' }}
                                onClick={() => this.getVideo()}>Start webcam</Button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', height: '100%', justifyContent: 'space-around    ' }}>
                        <div style={{
                            flex: '3',
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
            </div>
        )
    }
}

export default Container