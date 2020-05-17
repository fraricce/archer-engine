"use strict";
var applyDirection = require("./movement.js");
console.log(applyDirection);
var term = require("terminal-kit").terminal;
term.cyan("Welcome to Archer Engine: Build Your Own Text Adventure. \n");

function main(player) {
  runScene(player.pos);
}

let directions = ["North", "East", "South", "West"];
let basic = ["Inventory", "Look", "Help", "Quit"];
let longBow = { name: "An english longbow", strength: 5, skill: "archer", category:"weapon" };
let mushrooms = { name: "Some mushrooms", energy: 2, category:"food" };

let items = [longBow, mushrooms];

class Room {
  constructor(title, commands) {
    this.title = title;
    this.text = "";
    this.commands = commands;
    this.items = [];
  }
}

let roomNorthWest = new Room("You are in the wood", directions.concat(basic));
let roomNorthEast = new Room(
  "You are on the north-east side of the forest",
  directions.concat(basic)
);
let roomSouthWest = new Room(
  "You are south-west in the heart the forest",
  directions.concat(basic)
);
let roomSouthEast = new Room(
  "You are south-east of the forest",
  directions.concat(basic)
);
roomSouthEast.items = items;

var map = {
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
  feedback: "",
};

let showItems = false;
let updateItems = [];
let showInventory = false;

function runScene(pos) {
  term.clear();
  term.red(player.pos.x + " " + player.pos.y);
  term("\n" + player.feedback + "\n");
  player.feedback = "";
  let room = map.getTile(player.pos.x, player.pos.y);
  let commands = room.commands;
  term.green(room.title + "\n");

  if (showInventory) {
    if (player.items)
    showInventory = false;
  }

  if (showItems) {
    if (room.items.length > 0) {
      term.yellow("There is something here:" + "\n");
      room.items.forEach((k) => {
        let verb = "Pick";
          if (k.category === "food") {
            verb = "Eat";
          }
        let newItem = verb + " " + k.name;
        if (room.commands.indexOf(newItem)<0) {
          room.commands.push(verb + " " + k.name);
        }
        term.yellow(k.name + "\n");
      });
    } else {
      term.yellow("Nothing special." + "\n");
    }
    showItems = false;
  }

  term.singleColumnMenu(commands, function (error, response) {
    term("\n").eraseLineAfter.green(
      "#%s <(%s,%s)\n",
      response.selectedText,
      response.x,
      response.y
    );

    let res = response.selectedText;

    if (res.indexOf("Pick")>=0) {
      const item = res.substr(4).trim();
      const pickedItem = room.items.find(j=>j.name === item);
      player.items.push(pickedItem);
      room.items = room.items.filter(k=>k.name !== item);
      room.commands = room.commands.filter(k => k !== "Pick "+item);
      player.feedback = "You have now " + item + ".";
    }

    if (res.indexOf("Eat")>=0) {
      const item = res.substr(3).trim();
      console.log(item);
      const pickedItem = room.items.find(j=>j.name === item);
      room.items = room.items.filter(k=>k.name !== item);
      room.commands = room.commands.filter(k => k !== "Eat "+item);
      player.feedback = "You eaten " + item + " but with no appetite at all.";
      if (player.energy < 100 && pickedItem.energy > 0) {
        const tryVal = 100 - (player.energy + pickedItem.energy);
        player.energy+=tryVal;
        player.feedback = "Such a tasteful food. You feel recharged.";
      }

      if (pickedItem.energy < 0) {
        player.energy-=pickedItem.energy;
        if (Math.abs(pickedItem.energy) > 10) {
          player.feedback = "Food was poisoned. Your head is heavy, and you feel nausea.";
        }
      }
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
      console.log("Bye");
      process.exit();
    }

    runScene(player.pos);
  });
}

function renderRoomText(screen) {
  screen.title = "my window title";

  // Create a box perfectly centered horizontally and vertically.
  var box = blessed.box({
    top: "0",
    left: "center",
    width: 70,
    height: 15,
    content: "Hello {bold}world{/bold}!",
    tags: true,
    border: {
      type: "line",
    },
    style: {
      fg: "white",
      bg: "magenta",
      border: {
        fg: "#f0f0f0",
      },
      hover: {
        bg: "green",
      },
    },
  });

  // Append our box to the screen.
  screen.append(box);
  screen.render();
  return box;
}

main(player);
