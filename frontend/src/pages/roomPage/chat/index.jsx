import React, { useEffect, useState } from 'react';
import "./index.css";
import sound from "../../../assests/word-guessed.wav";

const Chat = ({ socket, word, setTimer, setIsPresenter, user, setUser, users, setUsers, round, setUserWithMaxPoints }) => {

    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");

    const capitalize = (str) => {
        return str
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
    };

    function play(){
        new Audio(sound).play()
    }

    useEffect(() => {
        socket.on("messageResponse", (data) => {
            setChat((prevChat)=>[...prevChat, data]);
            const capWord=capitalize(data.message);
            const name=data.name;
            const points=100;
            const userId=data.userId;

            if(capWord==word){
                socket.emit("wordIsGuessed",{name, userId, points});
            }
        });

        /*

        socket.on("wordGuessedResponse",(data)=>{
            const name=data.name;
            const message=`: : ${name} has guessed the word : : :`;
            setChat((prevChat)=>[...prevChat, {message}]);
            setTimer(0);
            setIsPresenter(false);

            console.log(data.userId, data.points);
            console.log("before",users);

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                  user.userId === data.userId ? { ...user, points: user.points + 1 } : user
                )
            );

            console.log("after",users);

        });

        */
        socket.on("wordGuessedResponse", (data) => {
            play();
            const name = data.name;
            const message = `: : ${name} has guessed the word : : :`;
            setChat((prevChat) => [...prevChat, { message }]);
            

            console.log("Users before update:", users);

            setUsers((prevUsers) => {
                const updatedUsers = prevUsers.map((user) => {
                    if (user.userId === data.userId) {
                        console.log(`Updating user ${user.userId} points from ${user.points} to ${user.points + data.points}`);
                        return { ...user, points: (user.points || 0) + data.points };
                    }
                    return user;
                });
                console.log("Updated Users:", updatedUsers);

                if(round==5){
                    const userWithMaxPoints = updatedUsers.reduceRight((maxUser, currentUser) => 
                        currentUser.points > maxUser.points ? currentUser : maxUser,
                        updatedUsers[updatedUsers.length-1]
                    );
                    setUserWithMaxPoints(userWithMaxPoints);
                }

                return updatedUsers;
            });

            console.log("users outside",users);

            

            setTimer(0);
            setIsPresenter(false);
        });

        // Cleanup socket listeners on component unmount
        return () => {
            socket.off("messageResponse");
            socket.off("wordGuessedResponse");
        };

    }, [socket, word, setTimer, setIsPresenter, setUsers, users])

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() != "") {
            setChat((prevChat)=>[...prevChat, {message,name:"You"}]);
            socket.emit("message", {message});
            setMessage("");
        }
    }

    return (
        <div className='chatRoom'>
            <div className='w-100 p-2 chat'>
                {chat.map((msg,index)=>(
                    <p key={index*999} className='my-1 w-100 '>
                        {msg.name}: {msg.message}
                    </p>
                ))}
            </div>
            <form onSubmit={handleSubmit} className='w-100 p-2 inputText'>
                <input className='w-100 inputField' placeholder='Enter your message' value={message} onChange={(e) => setMessage(e.target.value)} />
                <button type="submit" className="btn btn-primary btn-sm me-1" style={{ color: "white", backgroundColor: "#E67800" }}>Send</button>
            </form>
        </div>
    );
};

export default Chat;