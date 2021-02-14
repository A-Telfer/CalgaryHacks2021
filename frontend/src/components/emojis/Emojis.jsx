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

    render() {
        return (
            <div style={{ display: 'inline-block' }}>
                <div className="emojis">
                    <div className="align-right">
                    <img className="image"
                        width="100"
                        height="100"
                        src={happy}
                        alt={sad}/>
                    <img className="image"
                        width="70"
                        height="70"
                        src={sad}
                        alt={happy}/>
                    <img className="image"
                        width="50"
                        height="50"
                        src={sleepy}
                        alt={happy}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default Emojis;