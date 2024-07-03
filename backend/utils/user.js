const users = [];

//add user

const addUser = ({ name, roomid, userId, host, presenter,points, socketId }) => {
    const user = { name, roomid, userId, host, presenter,points, socketId };
    users.push(user);
    return getAllUsers(roomid);
}

//remove user

const removeUser = (id) => {
    const index = users.findIndex(user => user.socketId === id);
    if (index != -1) {
        const user=users.splice(index, 1)[0];
        return getAllUsers(user.roomid);
    }
}

//get user

const getUser = (id) => {
    return users.find(user => user.socketId === id);
}

//get all users

const getAllUsers = (roomid) => {
    return users.filter(user =>  user.roomid === roomid );
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getAllUsers
};