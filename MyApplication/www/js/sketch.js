const { fromEvent } = rxjs;

let player;
let items = [];
let players = [];
let item;
let startingRadius;   //pink  //orange //light green //skyblue //purple
let circleColour = ['#FF6961', '#FFB347', '#98FB98', '#87CEFA', '#EE82EE'];
let role = "";
let clicked = false;

var socket;
var id;
var eaten = false;
var data_item = [];
var speed = 3;
var score = 0;
var idx_it = 0;
var replay = false;
var win = false;
var defeat = false;
var showRules = true;
var ip = "";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  navigator.notification.prompt(
    'Please enter your IP address (e.g. 192.168.0.31:2000)',  // message
    onPrompt,                  // callback to invoke
    'Registration',            // title
    ['Ok','Exit']              // buttonLabels
  );
}
function onPrompt(results) {
    alert("You entered " + results.input1);
    ip = results.input1;
    setup();
}

function setup() {

  //socket = io.connect('http://'+window.location.hostname+':2000');
  //socket = io.connect('http://192.168.0.31:2000');  //change it to your ip address
  //socket = io.connect('http://edcsystem.hopto.org');
  socket = io.connect('http://'+ip+':2000'); 
  
  createCanvas(displayWidth, displayHeight);
  startingRadius = 32;
  //players' initial locations are randomly acclocated within the size of the stadium.
  player = new Play(random(-3000, 3000), random(-3000, 3000), startingRadius, 255);
  
  if(players.length < 1){
    for (let i = 0; i < 200; i++) {
      item = new Play(random(-3000, 3000), random(-3000, 3000), 10, random(circleColour));
      items.push(item);

      var tmp_data_item = {
        x: items[i].pos.x,
        y: items[i].pos.y,
        r: items[i].r,
        c: items[i].colour()
      };
      data_item.push(tmp_data_item);
    }
  }

  var data = {
    x: player.pos.x,
    y: player.pos.y,
    r: player.r,
    a: role,
    s: score
  };
  socket.emit('start', data);

  for (var i = 0; i < items.length; i++) {
    socket.emit('start_item', {
      x: items[i].pos.x,
      y: items[i].pos.y,
      r: items[i].r,
      c: items[i].colour()
    });
  }

  fromEvent(socket, "return_player").subscribe((data) => {
    players = data;
  });

  fromEvent(socket, "return_item").subscribe((data) => {
    items = data;
  });

  fromEvent(socket, "connect").subscribe((data) => {
    console.log('player connected');
  });
}

function draw() {
    var check_role = true;

    if (players.length == 1) {
      role = "it";
      
    } else if (players.length > 1){
      for (var i = players.length - 1; i >= 0 ; i--) {
        if (players[i].id !== socket.id && players[i].a == "it") {
          check_role = false;
        }
      }
      if (!check_role) {
        role = "runaway";

      } else if(check_role){
        role = "it";
      }
    }

    background("#008000");
    // show rules
    if (showRules == true) {
       if(width < height){
         textSize(15);
       } else {
         textSize(13);
       }

      fill(0);
      textStyle(BOLD);
      text("How to Play", width/2-50, 50);
      textStyle(NORMAL);

      //portrait
      if(width < height){ 
          text("\n\n 1. You are the white circle. \n Enemies are red circles. \n Allies are blue circles. \n\n 2. It's aim is to tag all the red circles, \n however you can only tag the \n circles that are smaller than you. \n\n 3. It wins when there is no runaways. \n\n 4. Runaways' aim is to eat orange circles \n to get scores. \n\n 5. Runaways win when the score hits 30. \n You may get more than two scores \n at once with any luck. \n\n 6. You don't need to drag the screen. \n Just touch one point which \n direction you want to go. \n\n 7. Touch the screen to start when you're ready.", width/2-150, 50);
      
      //landscape
      } else {
          text("\n\n 1. You are the white circle. Enemies are red circles. \n Allies are blue circles. \n\n 2. It's aim is to tag all the red circles, however \n you can only tag the circles that are smaller than you. \n\n 3. It wins when there is no runaways. \n\n 4. Runaways' aim is to eat orange circles to get scores. \n\n 5. Runaways win when the score hits 30. \n You may get more than two scores at once with any luck. \n\n 6. You don't need to drag the screen. \n Just touch one point which direction you want to go. \n\n 7. Touch the screen to start when you're ready.", width/2-150, 50);
      }

      if (mouseIsPressed) {
        showRules = false;
      }
    }
    //show your role and scores and other player's scores
    if(!showRules){
      fill(0);

      textSize(15);
      //show your role
      if (role == "it") {
        text("You are " + role, 47, 30);

      } else {
        text("You are " + role, 80, 30);
      }
      // show the number of players in the game
      if (players.length == 1) {
        text(players.length.toString() + " player", 44, 50);

      } else {
        text(players.length.toString() + " players", 50, 50);
      }
      //show your score
      text("My score: " + score.toString(), 60, 70);
      var space = 70;
      //show other players' scores
      for(var i = 0; i < players.length; i++){
        if(players[i].id !== socket.id){
          space = space + 20;
          text("Runaway" + i.toString() + ": " + players[i].s.toString(), 60, space);
        }
      }
    }
    //play again
    if (replay) {
      //win
      if (win == true && defeat == false) {
        textSize(30);
        fill(0);
        noStroke();
        text('Congratulations! \n You beat the game!', width/2, height/2 - 80);
      }
      //defeat
      if (defeat == true && win == false) {
        fill(0);
        noStroke();
        textSize(30);
        text('Game over.', width/2, height/2 - 80);
      }
      //play again box
      fill(255);
      rect(width/2-80, height/2 + 40, 160, 40, 15, 15, 15, 15);
      fill(0);
      text('Play again', width/2, height/2 + 70);

      //Test if the mouse is hovering over the button
      if (mouseX > width/2 - 80 && mouseX < width/2 + 80 && mouseY > height/2 + 30 && mouseY < height/2 + 90) {
        fill(0);
        rect(width/2-80, height/2 + 40, 160, 40, 15, 15, 15, 15);
        fill(255);
        text('Play again', width/2, height/2 + 70);

        //Test if the mouse is being pressed while hovering over the button
        if (mouseIsPressed) {
          //initialise variables
          circles = [];
          score = 0;
          replay = false;
          eaten = false;
          win = false;
          defeat = false;
          //after one game, player's role will be changed
          if (role == "it") {
            role = "runaway";

          } else if (role == "runaway") {
            role == "it"
          }

          //delete your previous circle & items
          for (var i = items.length - 1; i >= 0 ; i--) {
            items.splice(i,1);
            socket.emit('delete_item', i);
          }
          socket.emit('delete', socket.id);

          //initialise variables
          speed = 3;
          startingRadius = 32;
          //your new circle
          player = new Play(random(-3000, 3000), random(-3000, 3000), startingRadius, 255);

          //items are added
          for (let i = 0; i < 200; i++) {
            item = new Play(random(-3000, 3000), random(-3000, 3000), 10, random(circleColour));
            items.push(item);

            var tmp_data_item = {
              x: items[i].pos.x,
              y: items[i].pos.y,
              r: items[i].r,
              c: items[i].colour()
            };
            data_item.push(tmp_data_item);
          }

          var data = {
            x: player.pos.x,
            y: player.pos.y,
            r: player.r,
            a: role,
            s: score
          };
          socket.emit('start', data);

          for (var i = 0; i < items.length; i++) {
            socket.emit('start_item', {
              x: items[i].pos.x,
              y: items[i].pos.y,
              r: items[i].r,
              c: items[i].colour()
            });
          }
        }
      }
    }

    if (player.pos.x > 3000-1 || player.pos.x == 3000-1) {
      textSize(30);
      fill(0);
      noStroke();
      text("You can't go \n outside the stadium", width/2, height/2-80);

    } else if (player.pos.y > 3000-1 || player.pos.y == 3000-1) {
      textSize(30);
      fill(0);
      noStroke();
      text("You can't go \n outside the stadium", width/2, height/2-80);

    } else if (player.pos.x < -(3000-1) || player.pos.x == -(3000-1)) {
      textSize(30);
      fill(0);
      noStroke();
      text("You can't go \n outside the stadium", width/2, height/2-80);

    } else if (player.pos.y < -(3000-1) || player.pos.y == -(3000-1)) {
      textSize(30);
      fill(0);
      noStroke();
      text("You can't go \n outside the stadium", width/2, height/2-80);
    }

    translate(width/2 , height/2);
    scale(startingRadius / player.r);
    translate(-player.pos.x, -player.pos.y);

    //the boder of the stadium
    stroke(0);
    line(-3000, -3000, -3000, 3000);
    line(-3000, -3000, 3000, -3000);
    line(3000, -3000, 3000, 3000);
    line(3000, 3000, -3000, 3000);

    if (!eaten && !showRules) {
      for (var i = items.length - 1; i >= 0 ; i--) {
        if(items[i].c == undefined){

        } else {
          //display items
          fill(items[i].c);
          ellipse(items[i].x, items[i].y, items[i].r*2, items[i].r*2);
        }
      }

      for (var i = players.length - 1; i >= 0 ; i--) {
        //find other players
        if (players[i].id !== socket.id) {
          var enemy_id = players[i].id;
          var player_id = socket.id;

          //find different role
          if (players[i].a != role) {
            fill(255, 0, 0);
            ellipse(players[i].x, players[i].y, players[i].r*2, players[i].r*2);

            //find the same role
          } else if (players[i].a == role) {
            fill(0, 0, 255);
            ellipse(players[i].x, players[i].y, players[i].r*2, players[i].r*2);
          }

          //display players' role below their circles
          fill(0);
          textAlign(CENTER);
          textSize(20);
          text(players[i].a, players[i].x, players[i].y + players[i].r);

          player_pos = createVector(player.pos.x, player.pos.y);
          enemy_pos = createVector(players[i].x, players[i].y);
          let enemy_size = p5.Vector.dist(enemy_pos, player_pos);
          var eat = false;

          ////////////////////////////////out!!!/////////////////////////
          if (role == "runaway" && players[i].r > player.r) {
            console.log(enemy_size, players[i].r);
            if (enemy_size-10 < players[i].r) {
              console.log(enemy_size, players[i].r);
              eaten = true;
              defeat = true;
              replay = true;
            }

          ////////////////////////////tag!!!/////////////////////////////
          } else if(role == "it" && enemy_size < player.r && players[i].r < player.r){
            player.r = player.r + 1;
            console.log(enemy_size, player.r);
            players.splice(i,1);
            socket.emit('delete', enemy_id);

            if (players.length == 1) {
              win = true;
              replay = true;
            }
          }
        }
      }

      /////////////////////// runaways win when get 30 points /////////////////
      for (var i = players.length - 1; i >= 0 ; i--) {
        if (players[i].id !== socket.id) {
          if (players[i].a == "it" && role != "it") {
            idx_it = i;
          }
          if (role == "it" && players[i].s > 29) {
            defeat = true;
            eaten = true;
            replay = true;

          } else if (role == "runaway") {
            if (players[i].s > 29 || score > 29) {
              win = true;
              replay = true;
              defeat == false;
              if (score > 29) {
                players.splice(idx_it,1);
                //socket.emit('delete', enemy_id);
              }
            }
          }
        }
      }

      data_item = [];
      for (var i = items.length - 1; i >= 0 ; i--) {
        if(items[i].c == undefined){

          //display power-up effect of each item, the power-up effect depends on player's role
        } else {
          fill(items[i].c);
          ellipse(items[i].x, items[i].y, items[i].r*2, items[i].r*2);
          if ('#98FB98' == items[i].c) { //light green
            fill(0);
            textAlign(CENTER);
            textSize(20);
            if (role == "it") {
              text("Bigger", items[i].x, items[i].y + items[i].r + 5);

            } else {
              text("Smaller", items[i].x, items[i].y + items[i].r + 5);
            }

          } else if ('#87CEFA' == items[i].c) { //skyblue
            fill(0);
            textAlign(CENTER);
            textSize(20);
            if (role == "it") {
              text("Faster", items[i].x, items[i].y + items[i].r + 5);

            } else {
              text("Slower", items[i].x, items[i].y + items[i].r + 5);
            }

          } else if ('#FF6961' == items[i].c) { //pink
            fill(0);
            textAlign(CENTER);
            textSize(20);
            if (role == "it") {
              text("Smaller", items[i].x, items[i].y + items[i].r + 5);

            } else {
              text("Bigger", items[i].x, items[i].y + items[i].r + 5);
            }

          } else if ('#EE82EE' == items[i].c) { //purple
            fill(0);
            textAlign(CENTER);
            textSize(20);
            if (role == "it") {
              text("Slower", items[i].x, items[i].y + items[i].r + 5);

            } else {
              text("Faster", items[i].x, items[i].y + items[i].r + 5);
            }
          }
        }

        /////////////////////////eat items///////////////////////////////
        var player_pos = createVector(player.pos.x, player.pos.y);
        var items_pos = createVector(items[i].x, items[i].y);
        let items_size = p5.Vector.dist(items_pos, player_pos);
        if(items_size < player.r && items[i].r < player.r){
          if ('#98FB98' == items[i].c) { //light green
            if (player.r > 0) {
              if (role == "it") {
                player.r = player.r + 0.5;/////////////////bigger
              } else {
                player.r = player.r - 0.5;/////////////////smaller
              }
            }

          } else if ('#87CEFA' == items[i].c) { //skyblue
            if (speed < 5 || speed > 0) {
              if (role == "it") {
                speed = speed + 0.5;//////faster
              } else {
                speed = speed - 0.5;//////slower
              }
            }

          } else if ('#FF6961' == items[i].c) { //pink
            if (player.r > 0) {
              if (role == "it") {
                player.r = player.r - 0.5;/////////////////smaller
              } else {
                player.r = player.r + 0.5;/////////////////bigger
              }
            }

          } else if ('#EE82EE' == items[i].c) { //purple
            if (speed < 5 || speed > 0) {
              if (role == "it") {
                speed = speed - 0.5;//////slower
              } else {
                speed = speed + 0.5;//////slower
              }
            }

          } else if ('#FFB347' == items[i].c) { //orange
            if (role == "runaway") {
              score++;
            }
          }

          items.splice(i,1);
          socket.emit('delete_item', i);
        }
      }
      
      player.show();
      player.update(speed);
      
      var data = {
        x: player.pos.x,
        y: player.pos.y,
        r: player.r,
        a: role,
        s: score
      };
      socket.emit('update', data);
    }
}

// for landscape screen
function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}