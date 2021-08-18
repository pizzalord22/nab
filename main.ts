import {initClient} from "./client"

async function run() {
    const gameClient = await initClient("markjoling3@gmail.com", "notgonasayit2@", "6507147532435456")
    let money = await gameClient.getMoney()
    if (money === undefined) {
        console.log("money undefined")
        return
    }
    console.log("money", money)
    while (money > 100) {
        let stars = await gameClient.getPlayerOwnedStars()
        let s = stars.sort((s1, s2) =>
            gameClient.getCost(s1).sciCost - gameClient.getCost(s2).sciCost)[0]
        let buyResult = await gameClient.buyScience(s, gameClient.getCost(s).sciCost).catch(err => function (err: any) {
            if (err === "Not enough money to buy this upgrade.") {
                console.log(err)
                money = 0
            }
        }(err))
        money -= gameClient.getCost(s).sciCost
        console.log("buy result:", buyResult)
        console.log("remaining money:", money)
    }
}

run()