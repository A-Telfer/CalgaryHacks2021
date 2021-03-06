import React, { Component } from 'react';
import io from 'socket.io-client';
import './style.css';

import angry from './angry.png'
import disgust from './disgust.png'
import happy from './happy.png'
import sad from './sad.png'
import scared from './scared.png'
import sleepy from './sleepy.png'
import surprise from './surprise.png'

const ICONS = {
    happy: happy,
    sad: sad,
    surprised: surprise,
    neutral: sleepy,
    fearful: scared,
    disgusted: disgust,
    angry: angry
}

class Emojis extends Component {

    timeout;
    // socket = io.connect("http://localhost:3000");

    constructor(props) {
        super(props);

        // this.socket.on("emotion-data", function(data){
        //     var root = this;
        //     var interval = setInterval(function(){
        //         if(root.isDrawing) return;
        //         clearInterval(interval);
        //         var image = new Image();
        //         var canvas = document.querySelector('#board');
        //         var ctx = canvas.getContext('2d');
        //         image.onload = function() {
        //             ctx.drawImage(image, 0, 0);
        //
        //             root.isDrawing = false;
        //         };
        //         image.src = data;
        //     }, 100)
        // })
    }

    getIcon(index, size) {
        return <img className="image"
            width={size}
            height={size}
            src={ICONS[index]}
            alt={ICONS[index]}
            key={index} />
    }

    getIcons(indexArray) {
        let size = 70

        return (indexArray.map(index => {
            size = size - 10;
            return this.getIcon(index, size);
        }))
    }

    render() {
        return (
            <div style={{ display: 'inline-block' }}>
                <div className="emojis">
                    <div className="align-right">
                        {this.getIcons(this.props.order)}
                    </div>
                </div>
            </div>
        );
    }
}

export default Emojis;