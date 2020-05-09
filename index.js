"use strict";
var inquirer = require("inquirer");
console.log("Hello welcome to your adventure");
var directionsPrompt = {
  type: 'list',
  name: 'direction',
  message: 'Which direction would you like to go?',
  choices: ['Forward', 'Right', 'Left', 'Back', 'Quit']
};

function main(index) {
  console.log('You find youself in a small room, there is a door in front of you.');
  runScene(index);
}

let world = [{
  type: 'list',
  name: 'direction',
  message: 'Which direction would you like to go?',
  choices: ['Right', 'Quit']
}, {
  type: 'list',
  name: 'direction2',
  message: 'Which direction would you like to look go?',
  choices: ['Left', 'Quit']
}];

var index = 0;

function getQuestions(x) {
  return world[x];
}

function runScene(x) {
  let questions = getQuestions(x);
  inquirer.prompt(questions).then(answers => {
    if (answers.direction === 'Right') {
      console.log('Go right');
      runScene(++index);
    }

    if (answers.direction2 === 'Left') {
      console.log('Go left');
      runScene(--index);
    }
    
    if (answers.direction === 'Quit') {
      console.log('Bye');
      return;
    }
  });
}

main(index);