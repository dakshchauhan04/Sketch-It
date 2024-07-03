import React from "react";
import "./index.css";
import JoinRoomForm from "./JoinRoomForm";
import CreateRoomForm from "./CreateRoomForm";

const Form=({uuid1,socket,setUser})=> {
    return <div>

        <div className="container">
            
            <div className="item p-5">
                <h2>Create Room</h2>
                <CreateRoomForm uuid1={uuid1} socket={socket} setUser={setUser}/>
            </div>
            <div className="item p-5">
                <h2>Join Room</h2>
                <JoinRoomForm uuid1={uuid1} socket={socket} setUser={setUser}/>
            </div>
        </div>
      
    </div>
}

export default Form;