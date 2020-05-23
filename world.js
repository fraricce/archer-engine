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

class Player {
  constructor(name, pos) {
    this.name = name;
    this.pos = pos;
    this.energy = 100;
    this.items = [];
    this.tasks = [];
    this.points = 0;
    this.feedback = "";
  }
}

module.exports = { Creature, Task, TaskCondition, Room, ConditionType, Player }