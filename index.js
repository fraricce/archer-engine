"use strict";
var mov = require("./movement.js");
var term = require("terminal-kit").terminal;
const fs = require("fs");

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

var map = {};
var player = new Player("Fra", { x: 0, y: 0 });
player.feedback = "Your command:";

let showItems = false;
let showInventory = false;
let showDevice = false;
let showInfo = false;
let enableDebug = false;
let actionFlags = {};
const textWidth = 75;

function main(player) {
  enableDebug = process.argv.findIndex((i) => i === "-debug") >= 0;

  let story = process.argv.map((i) => { 
    const idx = i.indexOf("-story="); 
    if ( idx >= 0) {
      return i.substring(idx+7);
    } else {
      return null;
    }
  }).filter((s) => s != null);

  if (story.length === 0 || !story) {
    story.push('demo');
  }

  try {
    let rawdata = fs.readFileSync(`${story[0]}.json`);
    map = JSON.parse(rawdata);
  }
  catch (err) {
    term.cyan.red("\nOops..! Archer Engine: could not load story.\n");
    process.exit();
  }
  
  map.tiles.forEach(t => {
    t.commands.push("Look");
    t.commands.push("Inventory");
    t.commands.push("About");
    t.commands.push("Quit");
  });
  
  mainEmitter.on("acquireInput", (room, player) => {
    getInput(room, player);
  });
  
  term.on( 'key' , function( name , matches , data ) {
    if ( name === 'ESCAPE' && showInfo) { 
      showInfo = false;
      runScene(player.pos);
    }
  } ) ;
  
  runScene(player.pos);
}

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

const updatePlayerAfterDrink = (player, pickedItem) => {
  player.feedback =
    "You drank " + pickedItem.name;

  if (player.energy < 100 && pickedItem.energy > 0) {
    const tryVal = 100 - (player.energy + pickedItem.energy);
    player.energy += tryVal;
    player.feedback = "Such a refreshing drink. You feel recharged.";
  }

  if (pickedItem.energy < 0) {
    player.energy -= pickedItem.energy;
    if (Math.abs(pickedItem.energy) > 10) {
      player.feedback =
        "Drink was poisoned. Your head is heavy, and you feel dizzy.";
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

const drawHeader = (title, showPoints, showEnergy, points, energy) => {
  const lTitle = title.length;
  const preSpaces = 40 - lTitle / 2;
  let whiteSpaces = "";
  let j = 0;
  while (j++ < preSpaces) {
    whiteSpaces += " ";
  }
  term.black(whiteSpaces);
  term.yellow(title + "\n");
  term.bgBlack();
  term.yellow(
    "────────────────────────────────────────────────────────────────────────────"
  );

  let score = points.toString().padStart(2, "0");
  let energyField = showEnergy ? "Energy" : "      ";
  let scoreField = showPoints ? "Points:" + " " + score : "             ";

  if (showPoints || showEnergy || (showPoints && showEnergy)) {
    term.white(
      `\n\n ${scoreField}                                               ${energyField}`
    );
  }

  if (showEnergy) {
    term.bar(energy / 100, { barStyle: term.green });
  }
};

function runScene(pos, usedItem = undefined) {

  if (!enableDebug) term.clear();
  if (enableDebug) term.red(pos.x + " " + pos.y);

  if (showInfo) {
    term.wrapColumn({ x: 4, width: textWidth });
    term.wrap.yellow("\n" + map.title + "\n\nby " + map.author + "\n\n" + map.info + "\n\n");
    term.cyan("(ESC to exit)");
    return;
  }

  drawHeader(
    map.title,
    map.showPoints,
    map.showEnergy,
    player.points,
    player.energy
  );

  checkTask(player);

  let room = mov.getTile(map, pos.x, pos.y);

  if (!showInfo) {
    term.wrapColumn({ x: 2, width: textWidth });
    term.wrap.brightBlue("\n\n" + room.title + "\n");
    term.wrap.brightBlue("\n" + room.text);
  }

  term("\n\n " + player.feedback + "\n");
  player.feedback = "";

  if (room.tasks.length > 0) {
    room.tasks.forEach((h) => {
      if (!h.read) {
        term.wrapColumn({ x: 4, width: textWidth });
        term.wrap.brightBlue("\n" + h.description + "\n");
        h.read = true;
        player.tasks.push(h);
      }
    });
  }

  if (showDevice && usedItem) {
    term.wrapColumn({ x: 4, width: textWidth });
    term.wrap.white("\n[Using " + usedItem.name + "]\n");
    term.wrap.yellow(usedItem.messageAfterUse + "\n");
    showDevice = false;
  }

  if (showInventory) {
    if (player.items.length > 0) {
      term.wrapColumn({ x: 4, width: textWidth });
      term.wrap.yellow("\nYou have:" + "\n");
      player.items.forEach((y) => {
        term.wrapColumn({ x: 4, width: textWidth });
        term.wrap.yellow(toLower(y.name));
      });
      term.black("\n");
    } else {
      term.wrapColumn({ x: 4, width: textWidth });
      term.wrap.yellow("\nYou have nothing." + "\n");
    }
    showInventory = false;
  }

  if (showItems) {
    if (room.items.length > 0) {
      term.wrapColumn({ x: 4, width: textWidth });
      term.wrap.yellow("\nThere is something here:" + "\n");
      let quitIdx = room.commands.findIndex((y) => y === "About");
      room.items.forEach((k) => {
        let verb = getVerb(k);

        let newItem = verb + " " + k.name;

        if (room.commands.indexOf(newItem) < 0) {
          room.commands.splice(quitIdx++, 0, verb + " " + k.name);
        }

        term.wrapColumn({ x: 4, width: textWidth });
        term.wrap.yellow(toLower(k.name) + "\n");
      });
    }

    if (room.creatures.length > 0) {
      term.wrapColumn({ x: 4, width: textWidth });
      term.wrap.yellow("\nYou are not alone." + "\n");
      room.creatures.forEach((f) => {
        term.wrapColumn({ x: 4, width: textWidth });
        term.wrap.yellow("There is " + f.description + "\n");
      });
    }

    if (room.items.length === 0 && room.creatures.length === 0) {
      term.wrapColumn({ x: 4, width: textWidth });
      term.wrap.yellow("\nNothing special." + "\n");
    }

    showItems = false;
  }

  mainEmitter.emit("acquireInput", room, player);
}

const getVerb = (k) => {
  if (k.category === "food") {
    return "Eat";
  }

  if (k.category === "drink") {
    return "Drink";
  }

  if (k.canPick) {
    return "Pick";
  }

  if (k.canUse) {
    return "Use";
  }

}

const getInput = (room, player) => {

  const plainCommands = room.commands.map(m => { 
    const menuText = m["text"] ? m["text"] : m;
    const show = false;
    if (m["showIfIsTrue"] === undefined) {
      return menuText;
    }
    return actionFlags[m["showIfIsTrue"]] ?
      menuText : "?"; 
  });

  term.singleColumnMenu(plainCommands, function (error, response) {
    let res = response.selectedText;
    let commandParam;

    // look into aliases
    var alias = map.customCommands?.find((k) => k.alias === res);

    if (alias) {
      res = alias.mapTo;
      commandParam = alias.param;
    }

    if (res.indexOf("Pick") >= 0) {
      updatePlayerAfterPick(
        player,
        updateRoomObjects(res, "Pick", room, player)
      );
      runScene(player.pos);
      return;
    }

    if (res.indexOf("Use") >= 0) {
      showDevice = true;
      player.feedback = "Use";
      const cmd = "Use";
      const item = res.substr(cmd.length).trim();
      const usedItem = room.items.find((j) => j.name === item);
      if (!usedItem) return;
      player.points += usedItem.point
      actionFlags[usedItem.actionFlag] = true;
      runScene(player.pos, usedItem);
      return;
    }

    if (res.indexOf("Eat") >= 0) {
      updatePlayerAfterEat(player, updateRoomObjects(res, "Eat", room));
    }

    if (res.indexOf("Drink") >= 0) {
      updatePlayerAfterDrink(player, updateRoomObjects(res, "Drink", room));
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

    if (res === "About") {
      showInfo = true;
      player.feedback = "Info about this story";
      runScene(player.pos);
      return;
    }

    if (res === "?") {
      player.feedback = "Locked menu! Try something..";
      runScene(player.pos);
      return;
    }

    if (res === "Quit") {
      if (!enableDebug) term.clear();
      term.cyan.bold(" ─────────────────────────────────────────────");
      term.yellow("\n Thank you for playing this adventure! <3\n");
      term.cyan.bold(" Made with Archer Engine, by Francesco Ricceri\n");
      term.cyan.bold(" ─────────────────────────────────────────────\n");
      process.exit();
    }

    if (res == "Jump") {
      let rawdata = fs.readFileSync(alias.param);
      map = JSON.parse(rawdata);
      player.pos = { x: 0, y: 0 };
      runScene(player.pos);
      return;
    }

    if (res == "GoTo") {
      player.pos.y = commandParam;
      runScene(player.pos);
      return;
    }

    mov.applyDirection(map, player, res);
    runScene(player.pos);
  });
};

main(player);
