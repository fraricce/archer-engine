"use strict";
var inquirer = require("inquirer");
console.log("Hello welcome to your adventure");


function main(pos) {
  console.log('You find youself in a small room, there is a door in front of you.');
  runScene(pos);
}

let direction = {
  type: 'list',
  name: 'directions',
  message: 'Which direction would you like to go?',
  choices: ['North','Right','South','Left','Quit']
};

class Room {

  constructor(title, questions) {
    this.title = title;
    this.text = '';
    this.questions = questions;
  }
}

let roomNorthWest = new Room('You are in the wood', direction);
let roomNorthEast = new Room('You are on the north-east side of the forest', direction);
let roomSouthWest = new Room('You are south-west in the heart the forest', direction);
let roomSouthEast = new Room('You are south-east of the forest', direction);

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
    return this.tiles[row * map.cols + col]
  }
};

var pos = {x:0,y:0};

function getQuestions(x,y) {
  return map.getTile(x, y).questions;
}

function runScene(pos) {
  let questions = getQuestions(pos.x, pos.y);
  console.log(map.getTile(pos.x, pos.y).title);
  inquirer.prompt(questions).then(answers => {
    if (answers.directions === 'Right') {
      console.log('Go right');
      pos.x = pos.x+1; 
      runScene(pos);
    }

    if (answers.directions === 'Left') {
      console.log('Go left');
      pos.x = pos.x-1;
      runScene(pos);
    }

    if (answers.directions === 'South') {
      console.log('Go south');
      pos.y = pos.y+1;
      runScene(pos);
    }

    if (answers.directions === 'North') {
      console.log('Go north');
      pos.y = pos.y-1;
      runScene(pos);
    }
    
    if (answers.directions === 'Quit') {
      console.log('Bye');
      return;
    }
  });
}

main(pos);