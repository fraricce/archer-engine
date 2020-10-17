const getTile = (map, col, row) => {
  if (col < 0 || row < 0) return undefined;
  if (col >= map.cols || row >= map.rows) return undefined;
  return map.tiles[row * map.cols + col];
}

const applyDirection = (map, player, direction) => {
 
  let testTile = undefined;
  
  switch (direction) {
    case "North":
      testTile = getTile(map, player.pos.x, player.pos.y - 1);
      break;
    case "East":
      testTile = getTile(map, player.pos.x + 1, player.pos.y);
      break;
    case "South":
      testTile = getTile(map, player.pos.x, player.pos.y + 1);
      break;
    case "West":
      testTile = getTile(map, player.pos.x - 1, player.pos.y);
      break;
  }

  if (!testTile) {
    player.feedback = "Cannot go that way";
  } else {
    player.feedback = "Go " + direction;
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
    } 
  }
};

module.exports = { applyDirection, getTile }