import React from 'react';
import { Component } from 'react';
import Board from '../board/Board';
import io from 'socket.io-client';

import Emojis from "../emojis/Emojis";

import * as faceapi from 'face-api.js';
import './style.css';
import { calcEAR} from "./eye.helper";

import cv from "../../services/cv";

class Container extends Component {
    constructor(props) {
        super(props);

        this.videoRef = React.createRef();
        this.state = {
            color: "#000000",
            size: "5",
            socket: undefined,
            groupEmotions: ['happy', 'neutral', 'sad']
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

    startDrawing() {
        navigator.mediaDevices
            .getUserMedia({ video: { width: 300 } })
            .then((stream) => {
                let video = this.videoRef.current;
                video.srcObject = stream;
                video.play();

                const greenColorUpper = hue => new cv.Vec(hue, 0.8 * 255, 0.6 * 255); // change this values
                const greenColorLower = hue => new cv.Vec(hue, 0.1 * 255, 0.05 * 255); // change this values

                let dst = new cv.matFromImageData(video.height, video.width, cv.CV_8UC1);
                let cap = new cv.VideoCapture(video);


                const FPS = 30;
                function processVideo() {
                    try {
                        let frame = new cv.matFromImageData(video.height, video.width, cv.CV_8UC4);
                        cap.read(frame);

                        let begin = Date.now();

                        const imgHLS = frame.cvtColor(cv.COLOR_BGR2HLS);
                        const rangeMask = imgHLS.inRange(greenColorLower(80), greenColorUpper(140)); // change this values

                        const blurred = rangeMask.blur(new cv.Size(10, 10));
                        const thresholded = blurred.threshold(
                            200,
                            255,
                            cv.THRESH_BINARY
                        );

                        const contours = new cv.MatVector();
                        const hierarchy = new cv.Mat();
                        const thres = thresholded

                        let cnts = cv.findContours(thres, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
                        cnts = (cnts.length == 2) ? cnts[0] : (cnts.length == 3) ? cnts[1] : cnts

                        console.log("testingtesting", cnts.length.toString())

                        let c;

                        if (cnts.length > 0) {
                            c = cnts.reduce(function(max, cur) {
                                // here key is the cv2.contourArea function,
                                // we apply that on the cnts[i] and finds the cnts[i]
                                // such that cv2.contourArea(cnts[i]) is maximum
                                if(cv.contourArea(max) < cv.countourArea(cur)) {
                                    return cur
                                } else {
                                    return max
                                }
                            });
                            console.log("yayyyyyyy", cv.minEnclosingCircle(c))
                        }

                        cv.cvtColor(frame, dst, cv.COLOR_RGBA2GRAY);
                        // schedule the next one.
                        let delay = 1000 / FPS - (Date.now() - begin);
                        setTimeout(processVideo, delay);
                    } catch (err) {
                        console.error(err);
                    }
                }

                setTimeout(processVideo, 0);
            })
            .catch(err => {
                console.error("error:", err);
            });
    }


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
                        <div className="start-webcam-button">
                            <button onClick={() => this.startDrawing()}>Start drawing in space</button>
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
            </div>
        )
    }
}

export default Container