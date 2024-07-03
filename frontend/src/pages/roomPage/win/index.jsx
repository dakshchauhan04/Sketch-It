import React from 'react';
import "./index.css";
import sound from "../../../assests/win-sound.wav";

function play(){
    new Audio(sound).play()
}

const Win = ({userWithMaxPoints}) => {
    play();
    return <h1>{userWithMaxPoints.name} Wins</h1>
};


export default Win;