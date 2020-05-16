export function applyDirection(map, player, direction){
  let testTile = undefined;
  switch (direction) {
    case "North":
      testTile = map.getTile(player.pos.x, player.pos.y - 1);
      break;
    case "East":
      testTile = map.getTile(player.pos.x + 1, player.pos.y);
      break;
    case "South":
      testTile = map.getTile(player.pos.x, player.pos.y + 1);
      break;
    case "West":
      testTile = map.getTile(player.pos.x - 1, player.pos.y);
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
        player.pos.y = player.pos.y + 1;
        break;
      case "West":
        player.pos.x = player.pos.x - 1;
        break;
    } 
  }
};