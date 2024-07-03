import React from 'react';
import "./index.css";

const UserList = ({ users, user }) => {
    return (
        <div className='grid' style={{ display: 'initial' }}>
            {users.map(usr => (
                <div className='nameBox' key={usr.userId}> 
                    <h5>{usr.name} {user && user.userId === usr.userId && "(You)"} : {usr.points}pts</h5>
                </div>
            ))}
        </div>
    );
};


export default UserList;