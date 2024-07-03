import React, { useState, useRef } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";

const CreateRoomForm = ({ uuid1, socket, setUser}) => {
    const [roomId, setRoomId] = useState(uuid1());
    const [name, setName] = useState("");

    const navigate=useNavigate();

    const handleGenerateRoom = (e) => {
        e.preventDefault();

        const userData = {
            name, roomId, userId: uuid1(), host: true, presenter: true, points:0
        }
        setUser(userData);
        navigate(`/${roomId}`);  
    }

    const inputRef = useRef(null);

    const handleCopyClick = async () => {
        if (inputRef.current) {
          try {
            await navigator.clipboard.writeText(inputRef.current.value);
          } catch (err) {
            console.error('Failed to copy: ', err);
          }
        }
      };

    return <form>
        <div className="form-group m-2">
            <input className="input-group d-flex align-items-center justify-content-center  form-control" type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Your Name" />
        </div>
        <div className="form-group bg-white rounded m-2">
            <div className="input-group d-flex align-items-center justify-content-center m-0">
                <input className="m-2 form-control" ref={inputRef} value={roomId} disabled type="text" name="roomKey" placeholder="Generate Room Key" />

                <div className="input-group-append ">
                    <button type="button" className="btn btn-primary btn-sm me-1" onClick={() => setRoomId(uuid1())} style={{ color: "white", backgroundColor: "#E67800" }}>Generate</button>
                    <button type="button" className="btn btn-secondary btn-sm me-2" onClick={handleCopyClick} style={{ color: "white", backgroundColor: "#E67800" }}>Copy</button>
                </div>
            </div>
        </div>
        <button type="submit" className="mt-4 btn-block form-control border-0" onClick={handleGenerateRoom} style={{ color: "white", backgroundColor: "#E67800" }}>Generate Room</button>
    </form>
}

export default CreateRoomForm;