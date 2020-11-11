const getTile = (map, col, row) => {
  if (col < 0 || row < 0) return undefined;
  // be careful here: before was row >= map.rows
  if (col >= map.cols || row > map.rows) return undefined;
  return map.tiles[row * map.cols + col];
};

const applyDirection = (map, player, direction, jump) => {
  let testTile = undefined;

  switch (direction) {
    case "North":
    case "Back":
      testTile = getTile(map, player.pos.x, player.pos.y - 1);
      break;
    case "East":
      testTile = getTile(map, player.pos.x + 1, player.pos.y);
      break;
    case "South":
    case "Next":
      testTile = getTile(map, player.pos.x, player.pos.y + 1);
      break;
    case "West":
      testTile = getTile(map, player.pos.x - 1, player.pos.y);
      break;
    case "Goto":
      testTile = getTile(map, player.pos.x, jump);
      break;
    default:
      testTile = getTile(map, player.pos.x, player.pos.y + 1);
      break;
  }

  if (!testTile) {
    player.feedback = "Cannot go that way";
  } else {
    if (
      direction === "North" ||
      direction === "South" ||
      direction === "East" ||
      direction === "West"
    ) {
      player.feedback = "Go " + direction;
    }

    switch (direction) {
      case "North":
        player.pos.y = player.pos.y - 1;
        break;
      case "East":
        player.pos.x = player.pos.x + 1;
        break;
      case "South":
      case "Next":
        player.pos.y = player.pos.y + 1;
        break;
      case "West":
        player.pos.x = player.pos.x - 1;
        break;
      case "GoTo":
        player.pos.y = jump;
        break;
      default:
        player.pos.y = player.pos.y + 1;
        break;
    }
  }
};

module.exports = { applyDirection, getTile };
