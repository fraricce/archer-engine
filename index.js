"use strict";
var applyDirection = require("./movement.js");
var term = require("terminal-kit").terminal;

const {
  Player,
  Room,
  Creature,
  Task,
  TaskCondition,
  ConditionType,
} = require("./world.js");

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

var map = {
  title: "Company of Archers",
  author: "Francesco Ricceri",
  cols: 2,
  rows: 2,
  tsize: 4,
  tiles: [
    {
      cardinal: "NW",
      title: "You are in the wood",
      text: "The night has come, and the forest looks gloomy, as you go deeper between the trees. Ashes of a fire still smoke.",
      commands: ["North", "East", "South", "West", "Inventory", "Look", "Quit"],
      creatures: [],
      items: [],
      tasks: [],
    },
    {
      cardinal: "NE",
      title: "You are on the north-east side of the forest",
      text: "",
      commands: ["North", "East", "South", "West", "Inventory", "Look", "Quit"],
      creatures: [],
      items: [],
      tasks: [
        {
          title: "Pick the Longbow",
          description:
            "Suddenly, you hear a voice from the forest.. it says that you must find a longbow.",
          read: false,
          completed: false,
          point: 10,
          condition: {
            id: 1,
            condType: ConditionType[2],
            value: "An english longbow",
          },
        },
      ],
    },
    {
      cardinal: "SW",
      title: "You are south-west in the heart the forest",
      text: "The deeper you go in the wood, the cooler is the air. Misty fog surrounds leafs and logs, while you have strange feelings.",
      commands: ["North", "East", "South", "West", "Inventory", "Look", "Quit"],
      creatures: [
        {
          name: "Loic the Orc",
          description:
            "an orc. He looks angry. He holds a crossbow, aimed at you.",
          dangerous: true,
          damage: 10,
        },
      ],
      items: [],
      tasks: [],
    },
    {
      cardinal: "SE",
      title: "You are south-east of the forest",
      text: "This forest is a labyrinth, a kind of a maze. A nightowl spread its wings on a cedar tree. If you listen carefully, you can hear a flow of waters, probably a river.",
      commands: ["North", "East", "South", "West", "Inventory", "Look", "Quit"],
      creatures: [],
      items: [
        {
          name: "An english longbow",
          strength: 5,
          skill: "archer",
          category: "weapon",
        },
        { 
          name: "Some mushrooms", 
          energy: 2, 
          category: "food" },
      ],
      tasks: [],
    },
  ],
  getTile: function (col, row) {
    if (col < 0 || row < 0) return undefined;
    if (col >= map.cols || row >= map.rows) return undefined;
    return this.tiles[row * map.cols + col];
  },
};

var player = new Player("Fra", { x: 0, y: 0 });
player.feedback = 'Your command:';

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
  player.tasks.forEach((j) => {
    if (!j.completed) {
      if (j.condition.condType === "Visit") {
        if (
          player.x === j.condition.value.x &&
          player.y === j.condition.value.y
        ) {
          j.completed = true;
          player.feedback = "Great! Task completed (" + j.title + ")";
          player.points += j.point;
        }
      }
      if (j.condition.condType === "Pick") {
        player.items.forEach((r) => {
          if (r.name === j.condition.value) {
            j.completed = true;
            player.feedback = "Great! Task completed (" + j.title + ")";
            player.points += j.point;
          }
        });
      }
    }
  });
};

function runScene(pos) {
  if (!enableDebug) term.clear();
  if (enableDebug) term.red(player.pos.x + " " + player.pos.y);

  // put pre-spaces
  map.title;
  const lTitle = map.title.length;
  const preSpaces = 30 - lTitle / 2;
  let whiteSpaces = "";
  let j = 0;
  while (j++ < preSpaces) {
    whiteSpaces += " ";
  }
  term.black(whiteSpaces);
  term.yellow(map.title + "\n");
  term.bgBlack();
  term.yellow("────────────────────────────────────────────────────────────");
  // put post-spaces
  let score = player.points.toString().padStart(2, "0");
  term.white(`\n\nPoints: ${score}                                 Energy`);
  term.bar(player.energy / 100, { barStyle: term.green });
  checkTask(player);

  let room = map.getTile(player.pos.x, player.pos.y);
  let commands = room.commands;
  term.wrapColumn( { x: 4 , width: 58 } ) ;
  term.wrap.brightBlue("\n\n" + room.title + "\n");
  term.wrap.brightBlue("\n" + room.text);

  term("\n\n" + player.feedback + "\n");
  player.feedback = "";

  if (room.tasks.length > 0) {
    room.tasks.forEach((h) => {
      if (!h.read) {
        term.wrapColumn( { x: 4 , width: 58 } ) ;
        term.wrap.brightBlue("\n"+h.description + "\n");
        h.read = true;
        player.tasks.push(h);
      }
    });
  }

  if (showInventory) {
    if (player.items.length > 0) {
      term.wrapColumn( { x: 4 , width: 58 } ) ;
      term.wrap.yellow("\nYou have ");
      let i = 0;
      player.items.forEach((y) => {
        term.wrapColumn( { x: 4 , width: 58 } ) ;
        term.wrap.yellow(toLower(y.name));
      });
    } else {
      term.wrapColumn( { x: 4 , width: 58 } ) ;
      term.wrap.yellow("\nYou have nothing." + "\n");
    }
    showInventory = false;
  }

  if (showItems) {
    if (room.items.length > 0) {
      term.wrapColumn( { x: 4 , width: 58 } ) ;
      term.wrap.yellow("\nThere is something here:" + "\n");
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
        term.wrapColumn( { x: 4 , width: 58 } ) ;
        term.wrap.yellow(k.name + "\n\n");
      });
    }

    if (room.creatures.length > 0) {
      term.wrapColumn( { x: 4 , width: 58 } ) ;
      term.wrap.yellow("\nYou are not alone." + "\n");
      room.creatures.forEach((f) => {
        term.wrapColumn( { x: 4 , width: 58 } ) ;
        term.wrap.yellow("There is " + f.description + "\n");
      });
    }

    if (room.items.length === 0 && room.creatures.length === 0)
      term.yellow("\nNothing special.\n");

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
      player.feedback = "Look";
    }

    if (res === "Inventory") {
      showInventory = true;
      player.feedback = "Inventory";
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
