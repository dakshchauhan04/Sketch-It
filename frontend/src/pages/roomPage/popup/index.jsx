import React from 'react';
import "./index.css";

const PopUp = ({ trigger, setTrigger, setWord, socket }) => {

    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const word3 = words[Math.floor(Math.random() * words.length)];

    const handleClick = (event) => {
        setTrigger(false);
        setWord(event.target.value);
        socket.emit("chooseWord", event.target.value);
    };

    return (trigger) ? (
        <div className='words'>
            <button value={word1} onClick={handleClick} style={{ borderRadius: "0.2rem", margin: "0.25rem" }} >{word1}</button>
            <button value={word2} onClick={handleClick} style={{ borderRadius: "0.2rem", margin: "0.25rem" }} >{word2}</button>
            <button value={word3} onClick={handleClick} style={{ borderRadius: "0.2rem", margin: "0.25rem" }} >{word3}</button>
        </div>
    ) : "";
};


export default PopUp;

const words = [
    "Airplane",
    "Backpack",
    "Camera",
    "Dinosaur",
    "Engineer",
    "Forest",
    "Giraffe",
    "Hamburger",
    "Island",
    "Jungle",
    "Kangaroo",
    "Ladder",
    "Mountain",
    "Necklace",
    "Octopus",
    "Pyramid",
    "Quilt",
    "Robot",
    "Saxophone",
    "Telescope",
    "Unicorn",
    "Vampire",
    "Waterfall",
    "X-ray",
    "Yacht",
    "Zeppelin",
    "Bouquet",
    "Castle",
    "Dragon",
    "Eagle",
    "Firetruck",
    "Gloves",
    "Hedgehog",
    "Igloo",
    "Jellyfish",
    "Keyboard",
    "Lighthouse",
    "Microscope",
    "Ninja",
    "Owl",
    "Parachute",
    "Quicksand",
    "Rocket",
    "Submarine",
    "Treasure",
    "Ukulele",
    "Volcano",
    "Witch",
    "Xylophone",
    "Yeti",
    "Zookeeper",
    "House",
    "Tree",
    "Sun",
    "Flower",
    "Car",
    "Dog",
    "Cat",
    "Boat",
    "Fish",
    "Heart",
    "Star",
    "Balloon",
    "Smile",
    "Apple",
    "Cloud",
    "Snowman",
    "Cupcake",
    "Pencil",
    "Book",
    "Ice Cream",
    "Hat",
    "Pizza",
    "Guitar",
    "Moon",
    "Kite",
    "Bicycle",
    "Glasses",
    "Bed",
    "Butterfly",
    "Clock",
    "Drum",
    "Sofa",
    "Chair",
    "TV",
    "Lamp",
    "Key",
    "Flag",
    "Envelope",
    "Tent",
    "Bridge",
    "Banana",
    "Mushroom",
    "Ghost",
    "Cookie",
    "Sandwich",
    "Laptop"
];
