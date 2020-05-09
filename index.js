"use strict";
var inquirer = require("inquirer");
console.log("Hello welcome to your adventure");


function main(pos) {
  runScene(pos);
}

let direction = {
  type: 'list',
  name: 'directions',
  message: 'Which direction would you like to go?',
  choices: ['North','Right','South','Left','Quit']
};

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

let roomNorthWest = new Room('You are in the wood', direction);
let roomNorthEast = new Room('You are on the north-east side of the forest', direction);
let roomSouthWest = new Room('You are south-west in the heart the forest', direction);
let roomSouthEast = new Room('You are south-east of the forest', direction);
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

function runScene(pos) {

  console.log(pos.x + ' ' + pos.y)
  
  let room = map.getTile(pos.x, pos.y);
  let questions = room.questions;
  console.log('________________'+room.title+'________________');

  if (room.items.length > 0) {
    console.log('There are ');
    room.items.forEach(k=>{
      console.log(k.name);
    });
  }


  inquirer.prompt(questions).then(answers => {
    if (answers.directions === 'Right') {
      if (map.getTile(pos.x+1, pos.y) === undefined) {
        console.log('Cannot go that way');
      } else {
        console.log('Go right');
        pos.x = pos.x+1;
      }
    }

    if (answers.directions === 'Left') {
      if (map.getTile(pos.x-1, pos.y) === undefined) {
        console.log('Cannot go that way');
      } else {
        console.log('Go left');
        pos.x = pos.x-1;
      }
    }

    if (answers.directions === 'South') {
      if (map.getTile(pos.x, pos.y+1) === undefined) {
        console.log('Cannot go that way');
      } else {
        console.log('Go south');
        pos.y = pos.y+1;
      }
    }

    if (answers.directions === 'North') {
      if (map.getTile(pos.x, pos.y-1) === undefined) {
        console.log('Cannot go that way');
      } else {
        console.log('Go north');
        pos.y = pos.y-1;
      }
    }
    
    if (answers.directions === 'Quit') {
      console.log('Bye');
      return;
    }

    runScene(pos);
  });
}

main(pos);