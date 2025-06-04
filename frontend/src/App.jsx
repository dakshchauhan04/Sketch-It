import './App.css'
import Form from './components/forms';
import Header from './components/Header/header';
import { Route, Routes } from "react-router-dom";
import RoomPage from './pages/roomPage';
import { v4 as uuid1 } from 'uuid';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import sound from "./assests/join-sound.wav";

const server = "https://sketch-it-backend.onrender.com";

const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);

function play(){
  new Audio(sound).play()
}

const App = () => {

  const [user, setUser] = useState(null);
  const [users, setUsers]=useState([]);

  useEffect(() => {
    socket.on("userIsJoined", (data) => {
      if (data.success) {
        play();
        console.log("userJoined");
        setUsers(data.users);
      }
      else {
        console.log("error");
      }
    });

    socket.on("allUsers",(data)=>{
      setUsers(data);
      console.log(data);
    })

    socket.on("userIsJoinedMessage",(data) =>{
      toast.info(`${data} joined the room`);
    })

    socket.on("userLeftMessage",(data)=>{
      toast.info(`${data} left the room`);
    })

  }, [])

  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element={[<Header />, <Form uuid1={uuid1} socket={socket} setUser={setUser} />]} />
        <Route path='/:roomId' element={<RoomPage user={user} socket={socket} users={users} setUser={setUser} setUsers={setUsers}/>} />
      </Routes>
    </div>
  );
};

export default App
