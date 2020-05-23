"use strict";
var applyDirection = require("./movement.js");
var term = require("terminal-kit").terminal;
const EventEmitter = require("events");
class MainEmitter extends EventEmitter {}
const mainEmitter = new MainEmitter();

let showItems = false;
let showInventory = false;
let enableDebug = false;

function main(player) {
  enableDebug = process.argv.findIndex((i) => i === "-debug") >= 0;
  mainEmitter.on("acquireInput", (room, player) => {
    getInput(room, player);
  });
  runScene(player.pos);
}

let directions = ["North", "East", "South", "West"];
let basic = ["Inventory", "Look", "Quit"];
let longBow = {
  name: "An english longbow",
  strength: 5,
  skill: "archer",
  category: "weapon",
};
let mushrooms = { name: "Some mushrooms", energy: 2, category: "food" };
let items = [longBow, mushrooms];

const ConditionType = {
  1: "Visit",
  2: "Pick"
}

class TaskCondition {
  constructor(id, condType) {
    this.id = id;
    this.condType = condType;
    this.value = {}; // can be x,y for visit || string for pick
  }
}

class Task {
  constructor(title, description) {
    this.title = title;
    this.description = description;
    this.read = false;
    this.completed = false;
    this.point = 20;
    this.condition = {};
  }
}

class Creature {
  constructor(name, description, dangerous, damage) {
    this.name = name;
    this.description = description;
    this.dangerous = dangerous
    this.damage = damage;
  }
}

class Room {
  constructor(title, commands) {
    this.title = title;
    this.text = "";
    this.commands = commands;
    this.items = [];
    this.creatures = [];
    this.tasks = []
  }
}

const findLongbow = new Task('Pick the Longbow','Suddenly, you hear a voice from the forest.. it says that you must find a longbow.');
const findLongbowCondition = new TaskCondition(1, ConditionType[2]);
findLongbowCondition.value = "An english longbow";
findLongbow.condition = findLongbowCondition;

let roomNorthWest = new Room("You are in the wood", directions.concat(basic));

let roomNorthEast = new Room(
  "You are on the north-east side of the forest",
  directions.concat(basic)
);
roomNorthEast.tasks.push(findLongbow);

let roomSouthWest = new Room(
  "You are south-west in the heart the forest",
  directions.concat(basic)
);
let fogrod = new Creature('Loic the Orc', 'an orc. He looks angry. He holds a crossbow, aimed at you.', true, 10);
roomSouthWest.creatures.push(fogrod);
let roomSouthEast = new Room(
  "You are south-east of the forest",
  directions.concat(basic)
);
roomSouthEast.items = items;

var map = {
  title: "Company of Archers",
  author: "",
  cols: 2,
  rows: 2,
  tsize: 4,
  tiles: [roomNorthWest, roomNorthEast, roomSouthWest, roomSouthEast],
  getTile: function (col, row) {
    if (col < 0 || row < 0) return undefined;
    if (col >= map.cols || row >= map.rows) return undefined;
    return this.tiles[row * map.cols + col];
  },
};

var player = {
  pos: { x: 0, y: 0 },
  energy: 100,
  items: [],
  tasks: [],
  point:0,
  feedback: ""
};

const updateRoomObjects = (res, command, room, player) => {
  const item = res.substr(command.length).trim();
  const pickedItem = room.items.find((j) => j.name === item);
  room.items = room.items.filter((k) => k.name !== item);
  room.commands = room.commands.filter((k) => k !== command + " " + item);
  return pickedItem;
};

const updatePlayerAfterPick = (player, pickedItem) => {
  player.items.push(pickedItem);
  player.feedback = "You have now " + pickedItem.name + ".";
};

const updatePlayerAfterEat = (player, pickedItem) => {
  player.feedback =
    "You eat " + pickedItem.name + " but with no appetite at all.";

  if (player.energy < 100 && pickedItem.energy > 0) {
    const tryVal = 100 - (player.energy + pickedItem.energy);
    player.energy += tryVal;
    player.feedback = "Such a tasteful food. You feel recharged.";
  }

  if (pickedItem.energy < 0) {
    player.energy -= pickedItem.energy;
    if (Math.abs(pickedItem.energy) > 10) {
      player.feedback =
        "Food was poisoned. Your head is heavy, and you feel nausea.";
    }
  }
};

const toLower = (word) => {
  return word[0].toLowerCase() + word.substr(1);
};

const checkTask = (player) => {
  player.tasks.forEach(j=>{
    if (!j.completed) { 
      if (j.condition.condType === "Visit") {
        if (player.x === j.condition.value.x && player.y === j.condition.value.y) {
          j.completed = true;
          player.feedback = 'Great! Task completed ('+j.title+')';
        }
      }
      if (j.condition.condType === "Pick") {
        player.items.forEach(r=>{
          if (r.name === j.condition.value) {
            j.completed = true;
            player.feedback = 'Great! Task completed ('+j.title+')';
          }
        });
      }
    }
  })
}

function runScene(pos) {
  if (!enableDebug) term.clear();
  if (enableDebug) term.red(player.pos.x + " " + player.pos.y);
  
  // put pre-spaces
  map.title;
  const lTitle = map.title.length;
  const preSpaces = 30 - (lTitle / 2);
  let whiteSpaces = '';
  let j = 0;
  while(j++<preSpaces) {
    whiteSpaces += " ";
  }
  term.black(whiteSpaces);
  term.yellow(map.title + "\n");
  term.bgBlack();
  term.yellow("────────────────────────────────────────────────────────────");
  // put post-spaces
  
  term.cyan("\n\n                                         Energy");
  term.bar(player.energy / 100, { barStyle: term.green });
  checkTask(player);
  term("\n\n" + player.feedback + "\n");
  
  let room = map.getTile(player.pos.x, player.pos.y);
  let commands = room.commands;
  term.green("\n" + room.title + "\n");

  
  player.feedback = "";

  if (room.tasks.length > 0) {
    room.tasks.forEach(h=>{
      if (!h.read) {
        term.brightBlue(h.description+"\n");
        h.read = true;
        player.tasks.push(h);
      }
    });
  }
  
  if (showInventory) {
    if (player.items.length > 0) {
      term.yellow("You have ");
      let i = 0;
      player.items.forEach((y) => {
        term.yellow(toLower(y.name));
      });
    } else {
      term.yellow("You have nothing." + "\n");
    }
    showInventory = false;
  }

  if (showItems) {
    if (room.items.length > 0) {
      term.yellow("\nThere is something here:" + "\n");
      let quitIdx = room.commands.findIndex((y) => y === "Quit");
      room.items.forEach((k) => {
        let verb = "Pick";
        if (k.category === "food") {
          verb = "Eat";
        }
        let newItem = verb + " " + k.name;
        if (room.commands.indexOf(newItem) < 0) {
          room.commands.splice(quitIdx++, 0, verb + " " + k.name);
        }
        term.yellow(k.name + "\n");
      });
    }

    if (room.creatures.length > 0) {
      term.yellow("\nYou are not alone." + "\n");
      room.creatures.forEach((f)=>{
        term.yellow("There is "+f.description+"\n");
      });
    }

    if (room.items.length === 0 && room.creatures.length === 0)
      term.yellow("Nothing special." + "\n");
    
      showItems = false;
  }

  mainEmitter.emit("acquireInput", room, player);
}

const getInput = (room, player) => {
  term.singleColumnMenu(room.commands, function (error, response) {
    let res = response.selectedText;

    if (res.indexOf("Pick") >= 0) {
      updatePlayerAfterPick(
        player,
        updateRoomObjects(res, "Pick", room, player)
      );
    }

    if (res.indexOf("Eat") >= 0) {
      updatePlayerAfterEat(player, updateRoomObjects(res, "Eat", room));
    }

    if (res === "Look") {
      showItems = true;
    }

    if (res === "Inventory") {
      showInventory = true;
    }

    if (res === "North") {
      applyDirection(map, player, "North");
    }

    if (res === "East") {
      applyDirection(map, player, "East");
    }

    if (res === "South") {
      applyDirection(map, player, "South");
    }

    if (res === "West") {
      applyDirection(map, player, "West");
    }

    if (res === "Quit") {
      if (!enableDebug) term.clear();
      term.yellow(
        "Thank you for playing this old style adventure.\nThis game has been built with Archer Engine "
      );
      term.cyan.bold("by Francesco Ricceri");
      process.exit();
    }

    runScene(player.pos);
  });
};

main(player);
