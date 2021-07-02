const express = require('express')
const http = require('http')
const cors = require('cors')
const socketIo = require('socket.io')
const {randRoom} = require('./functions')
const {addUser, addFishToUser, getProfitPerUser, getRoundNumberForAllPlayers} = require('./players')

//Set up the port
const PORT = process.env.PORT || 5000

//Set up the app
const app = express()

const router = require('./router');
app.use(router)
app.use(cors())
const server = http.createServer(app)
const io = socketIo(server)

//Set up the room
const rooms = new Map()
let updatedPlayers
let roundCount
let profitableUsers
let counter = 0
let equalRoundUsers = []

const makeRoom = (resolve) => {
    var newRoom = randRoom()
    while(rooms.has(newRoom)){
        newRoom = randRoom()
    }
    rooms.set(newRoom, {roomId : newRoom, players : []})
    resolve(newRoom)
}

const joinRoom = (player, room) => {
    let currentRoom = rooms.get(room)
    let updatedPlayerList = currentRoom.players.push(player.name)
    let updatedRoom = {...currentRoom, players:updatedPlayerList}
}

const getNumberPlayers = (room) => {
    return rooms.get(room).players.length
}

const getAllPlayers = (room) => {
    return rooms.get(room).players
}
//Remove the latest player joined from a room's player list 
function kick(room){
    let currentRoom = rooms.get(room)
    currentRoom.players.pop()
}




//Set up the socket connection
io.on('connection', socket => {
    socket.on('create', () => {
        new Promise(makeRoom).then((room) => {
            socket.emit("NewGameCreated", room)
        })
    })
    socket.on('join', ({name, room}) => {
        if(rooms.has(room)){
            socket.emit("joinConfirmed")
        }
        else{
            socket.emit('errorMessage', {error : "No room with that ID found!"})
        }
    })
    socket.on('NewRoomJoin', ({name, room})=> {
        if(room === "" || name === ""){
            io.to(socket.id).emit("joinError")
        }
        socket.join(room)
        const id = socket.id
        const {user, error}= addUser(id, name, room)
        if(error){
            console.error(error)
        }
        joinRoom(user, room)
        const peopleInRoom = getNumberPlayers(room)
        const playersPlaying = getAllPlayers(room)
        console.log(peopleInRoom);

        //Check if right number of people are in the room
        if(peopleInRoom <  4){
            socket.emit("waiting", {message : peopleInRoom})
        }
        if(peopleInRoom === 4){
            io.to(room).emit('starting', {playersPlaying})
        }
        if(peopleInRoom > 4){
            socket.leave(room)
            kick(room)
            io.to(socket.id).emit('joinError')
        }
        socket.on('addFish',({roundNumber, fishNumber}) => {
            updatedPlayers = addFishToUser(id, fishNumber, roundNumber)
            roundCount = getRoundNumberForAllPlayers(updatedPlayers)
            socket.emit('waitingForOthers')
            for(var i in updatedPlayers){
                if(updatedPlayers[i].fish !== 0){
                    counter += 1
                }
            }
            console.log(counter);
            if(counter % 10 === 0 || counter % 16 === 0 ){
                console.log(counter);
                counter = 0
                equalRoundUsers = updatedPlayers
                console.log(equalRoundUsers);
                io.to(room).emit('GameStartingAgain')
            }
            socket.on('calculateProfits', () => {
                profitableUsers = getProfitPerUser(equalRoundUsers, roundCount)
                io.to(room).emit('profitsCalculated', {profitableUsers})
            })
        })
    })

    socket.on('disconnect', () => {
        const currentRooms = Object.keys(socket.rooms)
        if (currentRooms.length === 2){
            //The game room is always the second element of the list 
            const room = currentRooms[1]
            const num = getRoomPlayersNum(room)
            if(num < 4){
                rooms.delete(room)
            }
        }
    })
        
    
})

server.listen(PORT, ()=>console.log(`Listening on port ${PORT}`))