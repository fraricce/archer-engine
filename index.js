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


var map = {
  cols: 2,
  rows: 2,
  tsize: 4,
  tiles: [
    {
      title:'Room Start',
      questions: direction
    },
    {
      title:'Room Right',
      questions: direction
    },
    {
      title:'Room South',
      questions: direction
    },
    {
      title:'Room',
      questions: direction
    } 
  ],
  getTile: function(col, row) {
    return this.tiles[row * map.cols + col]
  }
};

//console.log(map.getTile(0,1))

var pos = {x:0,y:0};

function getQuestions(x,y) {
  return map.getTile(x, y).questions;
}

function runScene(pos) {
  let questions = getQuestions(pos.x, pos.y);
  console.log('You are in '+map.getTile(pos.x, pos.y).title);
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