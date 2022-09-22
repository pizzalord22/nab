import {TritonClient, TritonGame} from "ts-triton";
import {Star} from "ts-triton/dist/game";

export async function initClient(email: string, password: string, gameRef: string) {
    const tritonClient = new TritonClient(email, password);
    if (await tritonClient.authenticate()) {
        return new Client(tritonClient, gameRef);
    }
    throw new Error(tritonClient.loginErrorMessage);
}

export class Client {
    client: TritonClient;
    game: TritonGame
    event_messages: any

    constructor(tritonClient: TritonClient, gameRef: string) {
        this.client = tritonClient;
        this.game = this.client.getGame(gameRef);
    }

    // get event messages
    async getMessage() {
        const {diplomacy, events} = await this.game.getUnreadCount()
        this.event_messages = (await this.game.getEventMessages(events)).messages;
        return this.event_messages
    }

    async getMoney(): Promise<number|undefined> {
        await this.game.getFullUniverse();
        return this.game.currentUniverse.players[this.game.currentUniverse.player_uid].cash;
    }

    // buy 1 science on a specific star
    buyScience(star: Star, maxMoney: number) {
        const cost = this.getCost(star);
        if (cost.sciCost <= maxMoney) {
            return this.game.buyScience(star.uid.toString(), cost.sciCost)
        }

        console.log(cost.sciCost, maxMoney);
        return Promise.reject('Not enough money to buy this upgrade.');
    }

    // get the stars owned by the player
    async getPlayerOwnedStars(): Promise<Star[]> {
        await this.game.getFullUniverse();
        const starArray = Object.values(this.game.currentUniverse.stars)
        return starArray.filter(star => star.puid === this.game.currentUniverse.player_uid)
    }

    // get the cost of upgrades
    getCost(star: Star): { econCost: number, indusCost: number, sciCost: number } {
        if (star == undefined || (star.e == undefined || star.i == undefined || star.s == undefined|| star.r == undefined)) {
            return {
                econCost: 99999999,
                indusCost: 99999999,
                sciCost: 99999999,

            }
        }

        return {
            econCost: Math.floor((2.5 * (star.e + 1)) / (star.r / 100)),
            indusCost: Math.floor((5 * (star.i + 1)) / (star.r / 100)),
            sciCost: Math.floor((20 * (star.s + 1)) / (star.r / 100)),
        }
    }
}