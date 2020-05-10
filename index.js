"use strict";

var term = require( 'terminal-kit' ).terminal ;
term.cyan('Welcome to Archer Engine: Build Your Own Text Adventure. \n' ) ;

function main(pos) {
  runScene(pos);
}

let directions = [
	'North' ,
	'East' ,
  'South',
  'West'
];

let basic = [
  'Inventory',
  'Look',
  'Help',
  'Quit'
]

let longBow = { name:'An english longbow', strength:5, skill:'archer' };
let mushrooms = { name:'Some mushrooms', energy:2 };

let items = [
  longBow,
  mushrooms
];

class Room {

  constructor(title, questions) {
    this.title = title;
    this.text = '';
    this.questions = questions;
    this.items = [];
  }
}


let roomNorthWest = new Room('You are in the wood', directions.concat(basic));
let roomNorthEast = new Room('You are on the north-east side of the forest', directions.concat(basic));
let roomSouthWest = new Room('You are south-west in the heart the forest', directions.concat(basic));
let roomSouthEast = new Room('You are south-east of the forest', directions.concat(['Pick']).concat(basic));
roomSouthEast.items = items;

var map = {
  cols: 2,
  rows: 2,
  tsize: 4,
  tiles: [
    roomNorthWest,
    roomNorthEast,
    roomSouthWest,
    roomSouthEast
  ],
  getTile: function(col, row) {
    if (col<0||row<0) return undefined;
    if (col >= map.cols || row >= map.rows) return undefined;
    return this.tiles[row * map.cols + col]
  }
};

var pos = {x:0,y:0};

function getQuestions(x,y) {
  return map.getTile(x, y).questions;
}

let feedback = '';
let showInventory = false;

function runScene(pos) {
  
  term.clear();
  term.red(pos.x + ' ' + pos.y)
  term(feedback+'\n');
  feedback = '';
  let room = map.getTile(pos.x, pos.y);
  let questions = room.questions;
  term.green(room.title+'\n');

  if (showInventory) {
    if (room.items.length > 0) {
      term.yellow('There is something here:'+'\n');
      room.items.forEach(k=>{
        term.yellow(k.name+'\n');
      });
    } else {
      term.yellow('Nothing to see.'+'\n');
    }
    showInventory = false;
  }

  term.singleColumnMenu(questions, function( error , response ) {
    term('\n').eraseLineAfter.green(
      "#%s <(%s,%s)\n" ,
      response.selectedText ,
      response.x ,
      response.y
    );

    let res = response.selectedText;

    if (res === 'Look') {
      showInventory = true;
    }

    if (res === 'North') {
      if (map.getTile(pos.x, pos.y-1) === undefined) {
        feedback = 'Cannot go that way';
      } else {
        feedback = 'Go North';
        pos.y = pos.y-1;
      }
    }

    if (res === 'East') {
      if (map.getTile(pos.x+1, pos.y) === undefined) {
        feedback = 'Cannot go that way';
      } else {
        feedback = 'Go East';
        pos.x = pos.x+1;
      }
    }

    if (res === 'South') {
      if (map.getTile(pos.x, pos.y+1) === undefined) {
        feedback = 'Cannot go that way';
      } else {
        feedback = 'Go South';
        pos.y = pos.y+1;
      }
    }

    if (res === 'West') {
      if (map.getTile(pos.x-1, pos.y) === undefined) {
        feedback = 'Cannot go that way';
      } else {
        feedback = 'Go West';
        pos.x = pos.x-1;
      }
    }
    
    if (res === 'Quit') {
      console.log('Bye');
      process.exit() ;  
    }

    runScene(pos);
    
  } ) ;
  

}

function renderRoomText(screen) {
  screen.title = 'my window title';
   
  // Create a box perfectly centered horizontally and vertically.
  var box = blessed.box({
    top: '0',
    left: 'center',
    width: 70,
    height: 15,
    content: 'Hello {bold}world{/bold}!',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0'
      },
      hover: {
        bg: 'green'
      }
    }
  });
   
  // Append our box to the screen.
  screen.append(box);
  screen.render();
  return box;
}

main(pos);