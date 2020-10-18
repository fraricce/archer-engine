"use strict";
var mov = require("./movement.js");
var term = require("terminal-kit").terminal;
const fs = require('fs');

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
const textWidth = 75;

function main(player) {
  enableDebug = process.argv.findIndex((i) => i === "-debug") >= 0;
  let rawdata = fs.readFileSync('first-avenue.json');
  map = JSON.parse(rawdata);
  mainEmitter.on("acquireInput", (room, player) => {
    getInput(room, player);
  });
  runScene(player.pos);
}

let directions = ["North", "East", "South", "West"];
let basic = ["Inventory", "Look", "Quit"];

var map = {};

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

  let score = player.points.toString().padStart(2, "0");
  term.white(`\n\nPoints: ${score}                                 Energy`);
  term.bar(player.energy / 100, { barStyle: term.green });
  checkTask(player);

  let room = mov.getTile(map, player.pos.x, player.pos.y);

  term.wrapColumn( { x: 2 , width: textWidth } ) ;
  term.wrap.brightBlue("\n\n" + room.title + "\n");
  term.wrap.brightBlue("\n" + room.text);

  term("\n\n" + player.feedback + "\n");
  player.feedback = "";

  if (room.tasks.length > 0) {
    room.tasks.forEach((h) => {
      if (!h.read) {
        term.wrapColumn( { x: 4 , width: textWidth } ) ;
        term.wrap.brightBlue("\n"+h.description + "\n");
        h.read = true;
        player.tasks.push(h);
      }
    });
  }

  if (showInventory) {
    if (player.items.length > 0) {
      term.wrapColumn( { x: 4 , width: textWidth } ) ;
      term.wrap.yellow("\nYou have:" + "\n");
      player.items.forEach((y) => {
        term.wrapColumn( { x: 4 , width: textWidth } ) ;
        term.wrap.yellow(toLower(y.name));
      });
      term.black("\n");
    } else {
      term.wrapColumn( { x: 4 , width: textWidth } ) ;
      term.wrap.yellow("\nYou have nothing." + "\n");
    }
    showInventory = false;
  }

  if (showItems) {
    if (room.items.length > 0) {
      term.wrapColumn( { x: 4 , width: textWidth } ) ;
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
        term.wrapColumn( { x: 4 , width: textWidth } ) ;
        term.wrap.yellow(toLower(k.name) + "\n");
      });
    }

    if (room.creatures.length > 0) {
      term.wrapColumn( { x: 4 , width: textWidth } ) ;
      term.wrap.yellow("\nYou are not alone." + "\n");
      room.creatures.forEach((f) => {
        term.wrapColumn( { x: 4 , width: textWidth } ) ;
        term.wrap.yellow("There is " + f.description + "\n");
      });
    }

    if (room.items.length === 0 && room.creatures.length === 0) {
      term.wrapColumn( { x: 4 , width: textWidth } ) ;
      term.wrap.yellow("\nNothing special." + "\n");      
    }

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
      runScene(player.pos);
      return;
    }

    if (res.indexOf("Eat") >= 0) {
      updatePlayerAfterEat(player, updateRoomObjects(res, "Eat", room));
    }

    if (res === "Look") {
      showItems = true;
      player.feedback = "Look";
      runScene(player.pos);
      return;
    }

    if (res === "Inventory") {
      showInventory = true;
      player.feedback = "Inventory";
      runScene(player.pos);
      return;
    }

    if (res === "Quit") {
      if (!enableDebug) term.clear();
      term.cyan.bold(" ─────────────────────────────────────────────");
      term.yellow(
        "\n Thank you for playing this adventure! <3\n");
      term.cyan.bold(" Made with Archer Engine, by Francesco Ricceri\n");
      term.cyan.bold(" ─────────────────────────────────────────────\n");
      process.exit();
    }

    mov.applyDirection(map, player, res);

    runScene(player.pos);
  });
};

main(player);
