# ts-triton

A typescript client for the unpublished API for Neptune's Pride II: Triton (https://np.ironhelmet.com/)

The base mechanics were adapted from [phpTriton](https://github.com/wrenoud/phpTriton/) and then built on top of, like
adding the capability of giving carriers orders.

## Usage
You can initialize the client, authenticate, and get a game like the following:
```ts
import {TritonClient} from "ts-triton";

const client = new TritonClient('alias', 'password');
if (await client.authenticate()) {
    const game = client.getGame('game id');
}
```
From there you can use the functions inside the game object to interact with the game, such as getting data and
sending orders.

## Classes
### `TritonClient(alias: string, password: string, version: number = 7)`
* `authenticate()` - authenticates the player credentials, return true on success
* `getGame(gameId: string)` - returns a `TritonGame` object to interact with the game that has that ID
* `getServer()` - returns a `TritonServer` object to interact with the player details

### `TritonServer(client: TritonClient)`
* `getPlayer()` - returns the player information
* `getOpenGames()` - returns the open game information

### `TritonGame(client: TritonClient, gameId: string)`
* `getFullUniverse()` - returns game universe information
* `getIntel()` - returns intel statistics
* `getUnreadCount()` - returns the amount of unread messages
* `getPlayerAchievements()` - returns the player achievement information
* `getDiplomacyMessages(count: number, offset: number = 0)` - returns the player's diplomacy messages
* `getEventMessages(count: number, offset: number = 0)` - returns the player's event messages
* `readMessage(messageKey: string)` - marks a message as read
* `buyEconomy(star: string, price: number)` - upgrade the economy on a planet
* `buyIndustry(star: string, price: number)` - upgrade the industry on a planet
* `buyScience(star: string, price: number)` - upgrade the science on a planet
* `giveShipOrder(shipId: number, orders: ShipOrder[])` - give orders to ship carriers
* `getStarsInDistance(starId: number): Star[]` - Get the stars in travel distance of another star for you
* `getDistanceBetweenStars(startStarId: number, endStarId: number)` - Get the distance between two stars
* `findPathToStar(startStarId: number, endStarId: number, allowedToCrossOtherPlayers: boolean = false,
  otherPlayerWeightMultiplied: number = 2)` - Find a path of stars from one star to another