const express = require('express');
//const math = require('math');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const riders = require('./Riders');
const drivers = require('./Drivers');
const ratings = require('./Ratings');
const matches = require('./Matches');
//const logger = require('./middleware/logger');
//const members = require('./Members');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Init middleware
// app.use(logger);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//API Routes
app.use('/request', require('./routes/api/request'));
app.use('', require('./routes/api/rating'));

function linearDistance(x, y, x0, y0) {
  return Math.sqrt((x -= x0) * x + (y -= y0) * y);
}

function runningFunction(socket) 
{
  var matcher = setInterval(function() {
    riders.forEach(rider => {
      var matchedDriverIndex;
      
      var distance = Number.MAX_VALUE;
  
      for (i in drivers)
      {
        var newDistance = linearDistance(parseFloat(rider.startingX), parseFloat(rider.startingY), parseFloat(drivers[i].startingX), parseFloat(drivers[i].startingY));
  
        if (newDistance<distance)
        {
          distance = newDistance;
          matchedDriverIndex = i;
        }
      };

  
      var cost = distance*2;
  
      var match = {
        "riderName" : rider.name,
        "driverName" : drivers[matchedDriverIndex].name,
        "carNumber" : drivers[matchedDriverIndex].carNumber,
        "cost" : cost
      };
  
      matches.push(match);
  
      drivers.splice(matchedDriverIndex, 1);
  
    });
  
    var data = matches;
    socket.emit('matches', data);
  
    console.log(matches.length);
    matches.length = 0;
    riders.length = 0;
    drivers.length = 0;


    console.log(ratings);
  
  }, 5000);
}



// Run when client connects
io.of('communication').on('connection', socket => {

  console.log("connected");

  runningFunction(socket);

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));