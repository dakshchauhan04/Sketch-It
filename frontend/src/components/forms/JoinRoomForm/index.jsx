import React, { useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";

const JoinRoomForm = ({ uuid1, socket, setUser }) => {
    const [roomId, setRoomId] = useState("");
    const [name, setName] = useState("");

    const navigate = useNavigate();

    const handleJoinRoom = (e) => {
        e.preventDefault();

        const userData = {
            name, roomId, userId: uuid1(), host: true, presenter: false, points:0
        }
        setUser(userData);
        navigate(`/${roomId}`);
    }

    return <form>

        <div className="form-group m-2">
            <input className="input-group d-flex align-items-center justify-content-center  form-control" type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Your Name" />
        </div>

        <div className="form-group bg-white rounded m-2">
            <div className="input-group d-flex align-items-center justify-content-center m-0">
                <input className=" form-control" type="text" name="roomKey" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter Room Key" />
            </div>
        </div>

        <button type="submit" className="mt-4 btn-block form-control border-0" onClick={handleJoinRoom} style={{ color: "white", backgroundColor: "#E67800" }}>Enter Room</button>
    </form>
}

export default JoinRoomForm;