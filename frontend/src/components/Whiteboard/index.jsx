import React, { useEffect, useLayoutEffect, useState } from "react";
import rough from 'roughjs';
import "./index.css"

const roughGenerator = rough.generator;

const WhiteBoard = ({ canvasRef, ctxRef, elements, setElements, tool, color, user, socket, isPresenter }) => {

    // This use effect is to receive the imgUrl (canvas image) send by the server and show it to the joinee
    const [img, setImg] = useState(null);
    /*
    useEffect(() => {
        const handleWhiteboardDataResponse = (data) => {
            console.log("Received whiteboard data:", data);
            setImg(data.imgURL);
        };

        socket.on("whiteboardDataResponse", handleWhiteboardDataResponse);

        return () => {
            socket.off("whiteboardDataResponse", handleWhiteboardDataResponse);
        };
    }, [socket]);

    
   
    */
    useEffect(() => {
        socket.on("whiteboardDataResponse", (data) => {
            setImg(data.imgURL);
        });
    }, []);

    // This is present to remove any drawing privilege given to joinee and present only the image of the canvas
    /*
    useEffect(()=>{
        if (!isPresenter) {
            // return this div if the user is not the presenter
            return (
                <div className="whiteboard-container border border-dark border-4 overflow-hidden ">
                    <img
                        src={img} alt="real time whiteboard"
                        className="w-100 h-100"
                    />
                </div>
            );
        }
    },[isPresenter])
    */
    

    const [isDrawing, setIsDrawing] = useState(false);
    const strokeWidth = 5;

    // This is present to set the drawing configuration used by the presenter
    useLayoutEffect(() => {
        const canvas = canvasRef.current;

        if(canvas){

        const ctx = canvas.getContext("2d");

        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = "round";
        ctxRef.current = ctx;}
    }, [canvasRef, color, isPresenter]);



    useEffect(() => {
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.strokeStyle = color; // Set strokeStyle only if ctx exists
        }
    }, [color]);

    // its present to implement all the different drawing style on draw on the canvas
    useEffect(() => {
        const ctx = ctxRef.current;

        if(ctx){

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        elements.forEach((element) => {
            if (element.type === "pencil") {
                const roughCanvas = rough.canvas(ctx.canvas);
                roughCanvas.linearPath(element.path, { stroke: element.stroke, strokeWidth: 5, roughness: 0 });
            }
            else if (element.type === "line") {
                ctx.beginPath();
                ctx.moveTo(element.offsetX, element.offsetY);
                ctx.lineTo(element.width, element.height);
                ctx.strokeStyle = element.stroke;
                ctx.lineWidth = 5;
                ctx.stroke();
            }
            else if (element.type === "rectangle") {
                ctx.beginPath();
                ctx.strokeStyle = element.stroke;
                ctx.rect(
                    element.offsetX,
                    element.offsetY,
                    element.width - element.offsetX,
                    element.height - element.offsetY
                );
                ctx.stroke();
            }
            else if (element.type === "ellipse") {
                const ctx = ctxRef.current;
                ctx.beginPath();
                ctx.strokeStyle = element.stroke;
                // Calculate center and radius of the ellipse
                const centerX = (element.width + element.offsetX) / 2;
                const centerY = (element.height + element.offsetY) / 2;
                const radiusX = Math.abs(element.width - element.offsetX) / 2;
                const radiusY = Math.abs(element.height - element.offsetY) / 2;
                // Draw the ellipse
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
        

        });

        // to send the canvas image to the server which can thus be used by joinee
        const canvasImg = canvasRef.current.toDataURL();
        socket.emit("whiteboardData", canvasImg);}

    }, [elements]);

    useEffect(() => {
        if (isPresenter) {
            const ctx = ctxRef.current;
            if (ctx) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                setElements([]); // Clear elements state as well
            }
        }
    }, [isPresenter]);

    {/*

    useLayoutEffect(() => {

        const roughtCanvas = rough.canvas(canvasRef.current);

        if(elements.length>0){
            ctxRef.current.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
        }

        elements.forEach((element) => {

            if (element.type === "pencil") {
                roughtCanvas.linearPath(element.path);
            }
            else if (element.type === "line") {
                roughGenerator.draw(
                    roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height)
                );
            }
        });

    }, [elements])
    */}

   


    // to get the correct mouse coordinates with refrence to the canvas instead of the whole screen
    const getMouseCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // to give drawing privilege and give information about the pencil/line/rect/ellipse presenter is about to draw
    const handleMouseDown = (e) => {
        setIsDrawing(true);
        const { x, y } = getMouseCoordinates(e);

        if (tool === "pencil") {
            setElements((prevElements) => [...prevElements, {
                type: "pencil", offsetX: x, offsetY: y, path: [[x, y]], stroke: color
            }]);
        }
        else if (tool === "line") {
            setElements((prevElements) => [...prevElements, {
                type: "line", offsetX: x, offsetY: y, width: x, height: y, stroke: color
            }]);
        }
        else if (tool === "rectangle") {
            setElements((prevElements) => [...prevElements, {
                type: "rectangle", offsetX: x, offsetY: y, width: x, height: y, stroke: color
            }]);
        }
        else if (tool === "ellipse") {
            setElements((prevElements) => [...prevElements, {
                type: "ellipse", offsetX: x, offsetY: y, width: x, height: y, stroke: color
            }]);
        }
    }

    // to draw the actual shape the presenter is trying to draw
    const handleMouseMove = (e) => {
        const { x, y } = getMouseCoordinates(e);
        if (isDrawing) {
            if (tool === "pencil") {
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === prevElements.length - 1) {
                            const newPath = [...ele.path, [x, y]];
                            return { ...ele, path: newPath };
                        } else {
                            return ele;
                        }
                    })
                );
            }
            else if (tool === "line") {
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === prevElements.length - 1) {
                            return { ...ele, width: x, height: y };
                        } else {
                            return ele;
                        }
                    })
                );
            }
            else if (tool === "rectangle") {
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === prevElements.length - 1) {
                            return { ...ele, width: x, height: y };
                        } else {
                            return ele;
                        }
                    })
                );
            }
            else if (tool === "ellipse") {
                setElements((prevElements) =>
                    prevElements.map((ele, index) => {
                        if (index === prevElements.length - 1) {
                            return { ...ele, width: x, height: y };
                        } else {
                            return ele;
                        }
                    })
                );
            }
        }
    }

    // remove drawing privilege
    const handleMouseUp = (e) => {
        setIsDrawing(false);
    }

    // return this div if the user is presenter
    return (
        <>
            {isPresenter ? (
                <div onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
                    className="whiteboard-container">
                    <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="whiteboard-canvas" />
                </div>
            ) : (
                <div className="whiteboard-container">
                    {img && <img
                        src={img} alt="real time whiteboard"
                        className="w-100 h-100"
                    />}
                </div>
            )}
        </>
    );
}

export default WhiteBoard;