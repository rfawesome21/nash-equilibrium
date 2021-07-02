const users = []
let fishCounter_2 = 0
let roundCounter = 0


const addUser = (id, name, room) => {
    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()
    let fish = "0"
    let round = 0
    let myProfit = 0
    const user = { id, name, room, fish, round, myProfit }
    users.push(user)
    return { user }
}

const addFishToUser = (id, fishNumber, roundNumber) => {
    for(var i in users){
        if(users[i].id === id){
            users[i].fish = fishNumber
            users[i].round = roundNumber
        } 
    } 
    return users
}

const getProfitPerUser = (updatedUsers, roundCount) => 
{
    updatedUsers.forEach(user => {
            if(user.fish === "2"){
                fishCounter_2 += 1
            
    }
})
    switch(fishCounter_2){
        case 4:
            return updatedUsers.map(user => user.round === 1 || user.round === 2 || user.round === 3 || user.round === 4?{...user, myProfit : -25} : user)
        case 3:
            return updatedUsers.map(user => user.fish === "2"?{...user, myProfit : 25} : {...user, myProfit : -25})
        case 2:
            return updatedUsers.map(user => user.fish === "2"?{...user, myProfit : 50} : {...user, myProfit : -12.5})
        case 1:
            return updatedUsers.map(user => user.fish === "2"?{...user, myProfit :  75} : {...user, myProfit : 0}) 
        case 0:
            return updatedUsers.map(user => user.round === 1 || user.round === 2 || user.round === 3 || user.round === 4?{...user, myProfit : 25} : user)  
    }

}
    

const getRoundNumberForAllPlayers = (updatedPlayers) => {
    updatedPlayers.forEach(user => {
        if(user.round === 1){
            roundCounter += 1
        }
    })
    return roundCounter
}



const getUsersInRoom = (room) => users.filter((user) => user.room === room)

module.exports = {addUser, addFishToUser, getUsersInRoom, getProfitPerUser, getRoundNumberForAllPlayers}