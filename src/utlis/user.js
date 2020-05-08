const users = []

//addUser, removeUser, getUser, getUserInRoom

const addUser = ({id, username, room})=>{
    
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username||!room){
        return {
            error: 'the Username and room is required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)  =>{
        return user.room === room && user.username === username
    })
    console.log(existingUser)
    
    //validate username
    if (existingUser){
        return {
            error: 'username is used'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return {
        user
    }
}

//remove
const removeUser = (id)=>{
    const index = users.findIndex((user) => user.id === id)
    
    if(index !== -1){
       return  users.splice(index, 1)[0]
    }
}


//get user by their id
const getUser = (id)=>{
    return users.find((user)=>user.id === id)
}


//get users by their room name
const getUsersInRoom = (room)=>{
    return users.filter((user)=>user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}