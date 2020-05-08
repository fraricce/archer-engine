'use strict';
var inquirer = require('inquirer');
console.log('Hello welcome to your adventure');
var questions = [
  {
    type: 'input',
    name: 'action',
    message: "What's your next action?"
  }
];

function ask() {
  let currentScene = questions;
  while (true) {
    inquirer.prompt(questions).then(answers => {
      console.log('You said: ' + answers.action)
      if (answers.action !== 'quit') {
        ask();
      } else {
        console.log('Your action:', answers.action);
      }
    });
  }
  
}

ask();