const express = require('express')  
const path = require('path')
const http = require('http')    
const socketio = require('socket.io') 
const Filter = require('bad-words')


const {generateMessage, generateLocationMessage} = require('../src/utlis/message')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utlis/user')

const app = express()

const server = http.createServer(app) 
const io = socketio(server) // now our server support web socket

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

// MAIN SOCKET CONNECTION
io.on('connection',(socket)=>{    // in built event
    console.log('the server is connected!!!!')

    socket.on('join', (options, callback)=>{          //options = {username, room} 
        const {error, user} = addUser({id: socket.id, ...options})
        
        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Admin', 'welcome!'))  
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin', `${user.username} is joined!`))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()
    })

    
    socket.on('sendMessage',(message,callback)=>{

        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)){
           return callback('profanity is not allowed!')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))

        callback()
    })
 
    socket.on('disconnect',()=>{      //in built event
    const user = removeUser(socket.id)
     if(user){
        io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
          
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
      }
    })

    socket.on('locationMessage',(cords,callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('location',generateLocationMessage(user.username,`https://google.com/maps?q=${cords.latitude},${cords.longitude}`))
        callback() 
    }) 
})

server.listen(port,()=>{ 
    console.log(`server is up in port ${port}`)
})