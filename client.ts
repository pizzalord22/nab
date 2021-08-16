import {TritonClient, TritonGame} from "ts-triton";
import {Star} from "ts-triton/dist/game";

export async function initClient(email: string, password: string, gameRef: string) {
    const tritonClient = new TritonClient(email, password);
    if(await tritonClient.authenticate()) {
        return new Client(tritonClient, gameRef);
    }
    throw new Error(tritonClient.loginErrorMessage);
}

class Client {
    client: TritonClient;
    game: TritonGame
    event_messages: any

    constructor(tritonClient: TritonClient, gameRef: string) {
        this.client = tritonClient;
        this.game = this.client.getGame(gameRef);
    }

    async getMessage() {
        const {diplomacy, events} = await this.game.getUnreadCount()
        this.event_messages = (await this.game.getEventMessages(events)).messages;
        return this.event_messages
    }

    async getMoney(): Promise<number> {
        await this.game.getFullUniverse();
        return this.game.currentUniverse.players[this.game.currentUniverse.player_uid].cash;
    }

    // buy 1 science on a specific star
    buyScience(star: Star, maxMoney: number) {
        const cost = Client.getCost(star);
        if (cost.sciCost < maxMoney) {
            return this.game.buyScience(star.uid.toString(), cost.sciCost)
        }
        return Promise.reject('Not enough money to buy this upgrade.');
    }

    getPlayerOwnedStars(): Star[] {
        const starArray = Object.values(this.game.currentUniverse.stars)
        return starArray.filter(star => star.puid === this.game.currentUniverse.player_uid)
    }

    private static getCost(star: Star): { econCost: number, indusCost: number, sciCost: number } {
        return {
            econCost: Math.floor((2.5 * (star.e + 1)) / (star.r / 100)),
            indusCost: Math.floor((5 * (star.i + 1)) / (star.r / 100)),
            sciCost: Math.floor((20 * (star.s + 1)) / (star.r / 100)),
        }
    }
}