const randRoom = () => {
    var result = '';
    var hexChars = '0123456789ABCDEF';
    for (var i = 0; i < 5; i += 1) {
        result += hexChars[Math.floor(Math.random() * 16)];
    }
    return result;
}


module.exports = {randRoom}