
module.exports = function(io, socket) {

    socket.on('start', function(data){
       console.log(data);
       socket.join(data.userId);
    });

    socket.on('disconnect', function(userId){
        console.log('disconnect');
    });

};
