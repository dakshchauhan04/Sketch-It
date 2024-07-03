import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import WhiteBoard from "../../components/Whiteboard";
import UserList from "./users";
import Chat from "./chat";
import PopUp from "./popup";
import Win from "./win";
import { useParams } from "react-router-dom";

const RoomPage = ({ user, socket, users, setUser, setUsers }) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const currentPresenterRef = useRef(null);
    const nextPresenterRef = useRef(null);

    const [tool, setTool] = useState("pencil");
    const [color, setColor] = useState("black");
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([]);
    const [trigger, setTrigger] = useState(true);
    const [word, setWord] = useState("");
    const [timer, setTimer] = useState(30);
    const [round, setRound] = useState(1);
    const [isPresenter, setIsPresenter] = useState(user?.presenter || false);
    const [userWithMaxPoints, setUserWithMaxPoints] = useState(null);

    const { roomId } = useParams();

    useEffect(() => {
        if (user && roomId) {
            const existingUser = users.find(u => u.userId === user.userId);
            if (!existingUser) {
                socket.emit("userJoined", {
                    name: user.name,
                    roomid: roomId,
                    userId: user.userId,
                    host: user.host,
                    presenter: user.presenter,
                    points: 0
                });
            } else {
                console.log('User already connected:', user.userId);
            }
        }
    }, [user]);


    useEffect(() => {
        let countdown;

        socket.on("sendWord", (data) => {
            setWord(data);
            setTimer(30);

            if (countdown) clearInterval(countdown); // Clear previous interval if exists

            countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer > 0) {
                        return prevTimer - 1;
                    } else {
                        clearInterval(countdown);
                        if (round < 5) {
                            setRound((prevRound) => prevRound + 1);
                        } else {
                            
                            setTrigger(false);
                            
                        }
                        return 0;
                    }
                });
            }, 1000);
        });

        return () => {
            if (countdown) clearInterval(countdown); // Cleanup the interval on component unmount
            socket.off("sendWord"); // Cleanup the socket listener on component unmount
        };
    }, [socket, round, users.length]);

    useEffect(() => {
        socket.on("changePresenterResponse", (data) => {
            console.log("Received changePresenterResponse:", data);

            if (data.currentPresenter && data.nextPresenter) {
                currentPresenterRef.current = data.currentPresenter;
                nextPresenterRef.current = data.nextPresenter;

                console.log("Current Presenter Ref:", currentPresenterRef.current);
                console.log("Next Presenter Ref:", nextPresenterRef.current);

                if (user.userId === currentPresenterRef.current.userId) {
                    console.log("Setting Presenter to False");
                    setIsPresenter(false);
                }

                if (user.userId === nextPresenterRef.current.userId) {
                    console.log("Setting Presenter to True");
                    setIsPresenter(true);
                    setTrigger(true);
                }
            } else {
                console.log("Presenter data is missing or incomplete:", data);
            }
        });

        return () => {
            socket.off("changePresenterResponse");
        };
    }, [socket, user.userId]);


    /*

    useEffect(() => {

        socket.on("changePresenterResponse", (data)=>{
            console.log(currentPresenterRef.current);
            console.log(nextPresenterRef.current);
            console.log(user.userId);

            if (user.userId===currentPresenterRef.current?.userId) {
                setIsPresenter(false);
            } else if (user.userId===nextPresenterRef.current?.userId) {
                setIsPresenter(true);
            }
             
        });
        
    }, [socket]);

    */

    useEffect(() => {
        if (isPresenter) {
            const currentPresenterIndex = users.findIndex(u => u.userId === user.userId);
            const nextPresenterIndex = (currentPresenterIndex + 1) % users.length;
            const currentPresenter = users[currentPresenterIndex];
            const nextPresenter = users[nextPresenterIndex];

            currentPresenterRef.current = currentPresenter;
            nextPresenterRef.current=nextPresenter;

            console.log("guessed");
            console.log(isPresenter); 
           
        }
        else if (!isPresenter){
            socket.emit("changePresenter",{currentPresenter: currentPresenterRef.current,nextPresenter: nextPresenterRef.current});
        }

    }, [isPresenter, users, user.userId]);

    
    
    /*
    useEffect(() => {
        socket.on("changePresenterResponse", (data) => {

            if (user.userId === data.user1.userId) {
                setIsPresenter(false);
            }
        });

        return () => socket.off("changePresenterResponse");
    }, [socket, setUser, user.presenter, user.userId]);

    */

    /*
    useEffect(() => {

        socket.on("sendWord",(data)=>{
            setWord(data);
        })

        if (word) {
            setTimerStarted(true);
            setTimer(30); // Reset the timer when a new word is chosen

            const countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer > 0) {
                        return prevTimer - 1;
                    } else {
                        clearInterval(countdown);
                        setRound(round+1);
                        return 0;
                    }
                });
            }, 1000);

            return () => clearInterval(countdown); // Cleanup the interval on component unmount
        }
    }, [word]);

    */

    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setElements([]);
    };

    const handleUndo = () => {
        setHistory((prevHistory) => {
            return [...prevHistory, elements[elements.length - 1],]
        });
        setElements((prevElements) =>
            prevElements.slice(0, prevElements.length - 1)
        );
    };

    const handleRedo = () => {
        setElements((prevElements) => {
            return [...prevElements, history[history.length - 1]]
        });
        setHistory((prevHistory) =>
            prevHistory.slice(0, prevHistory.length - 1)
        );
    }

    function hideWord(inputString) {
        // Replace all alphabetic characters with hyphens, returning a new string
        return inputString.replace(/[a-zA-Z]/g, '-');
    }

    return (
        <div>
            <div className="header">
                <h1 style={{ fontSize: "xxx-large", textAlign: "left", padding: "15px" }}>Sketch It!</h1>
            </div>
            <div className="grid-container">

                <div className="grid-item" id="round">

                    <div><h2 style={{ paddingBottom: "0" }}>Round {round} of 5</h2></div>

                    <div className="word">
                        {isPresenter ? (<h4>{word}</h4>) : (<h4>{hideWord(word)}</h4>)}
                    </div>

                    <div className="timer"><h4>Time: {timer}s</h4></div>

                </div>

                <UserList users={users} user={user}/>

                <div className="grid-item" id="whiteboard">

                    {(isPresenter && !userWithMaxPoints) && (<div className="popup">
                        <PopUp trigger={trigger} setTrigger={setTrigger} setWord={setWord} socket={socket}></PopUp>
                    </div>)}

                    {userWithMaxPoints && (<div className="popup"><Win userWithMaxPoints={userWithMaxPoints}/></div>)}

                    {!userWithMaxPoints && (<WhiteBoard canvasRef={canvasRef} ctxRef={ctxRef} elements={elements} setElements={setElements} tool={tool} color={color} user={user} socket={socket} isPresenter={isPresenter} />)}
                </div>

                {word && (<Chat socket={socket} word={word} setTimer={setTimer} setIsPresenter={setIsPresenter} key={word} user={user} setUser={setUser} users={users} setUsers={setUsers} round={round} setUserWithMaxPoints={setUserWithMaxPoints} id="chat" />)}

                {isPresenter && (

                    <div className="grid-item" id="toolBar">

                        <div id="tools">
                            <div>
                                <label for="pencil">Pencil</label>
                                <input type="radio" id="pencil" name="tool" value="pencil" onChange={(e) => setTool(e.target.value)} checked={tool === "pencil"} />
                            </div>

                            <div>
                                <label for="line">Line</label>
                                <input type="radio" id="line" name="tool" value="line" onChange={(e) => setTool(e.target.value)} checked={tool === "line"} />
                            </div>

                            <div>
                                <label for="rectangle">Rectangle</label>
                                <input type="radio" id="rectangle" name="tool" value="rectangle" onChange={(e) => setTool(e.target.value)} checked={tool === "rectangle"} />
                            </div>

                            <div>
                                <label for="ellipse">Ellipse</label>
                                <input type="radio" id="ellipse" name="tool" value="ellipse" onChange={(e) => setTool(e.target.value)} checked={tool === "ellipse"} />
                            </div>
                        </div>

                        <div id="colors">
                            <label for="color">Select Color: </label>
                            <input type="color" id="color" value={color} onChange={(e) => setColor(e.target.value)} />
                        </div>

                        <div id="undoRedo">
                            <button type="button" className="btn btn-primary btn-sm me-1" disabled={elements.length === 0} onClick={handleUndo} style={{ color: "white", backgroundColor: "#E67800" }}>Undo</button>
                            <button type="button" className="btn btn-primary btn-sm me-2" disabled={history.length === 0} onClick={handleRedo} style={{ color: "white", backgroundColor: "#E67800" }}>Redo</button>
                        </div>

                        <div id="clear">
                            <button type="button" className="btn btn-primary btn-sm me-1" onClick={handleClearCanvas} style={{ color: "white", backgroundColor: "#E67800" }}>Clear Canvas</button>
                        </div>
                    </div>

                )}

            </div>
        </div>
    )
}

export default RoomPage;