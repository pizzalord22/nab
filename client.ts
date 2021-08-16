import {TritonClient, TritonGame} from "ts-triton";

declare type Star = {
    /**
     * The name of the star.
     */
    n: string;
    /**
     * The ID of the player who owns this star.
     */
    puid: number;
    /**
     * The ID of this star.
     */
    uid: number;
    /**
     * If the star is visible to the user.
     * 0 = no
     * 1 = yes
     */
    v: string;
    /**
     * The X coordinate of the star.
     * The value is 1/8 the amount of light years distance.
     */
    x: string;
    /**
     * The Y coordinate of the star.
     * The value is 1/8 the amount of light years distance.
     */
    y: string;
    /**
     * The current economy level.
     * Only present when the star is visible to the user.
     */
    e?: number;
    /**
     * If the star has a warpgate.
     * Only present when the star is visible to the user.
     * 0 = no
     * 1 = yes
     */
    ga?: number;
    /**
     * The current industry level.
     * Only present when the star is visible to the user.
     */
    i?: number;
    /**
     * The natural resources of the star.
     * Only present when the star is visible to the user.
     */
    nr?: number;
    /**
     * The total resources of the star, including terraforming bonus.
     * Only present when the star is visible to the user.
     */
    r?: number;
    /**
     * The current science level.
     * Only present when the star is visible to the user.
     */
    s?: number;
    /**
     * The number of ships on the star.
     * Only present when the star is visible to the user.
     */
    st?: number;
};

class Client {
    client: TritonClient;
    game_ref: string
    game: TritonGame
    event_messages: any

    constructor(email: string, password: string, game_ref: string) {
        this.client = new TritonClient(email, password);
        this.game_ref = game_ref;
    }

    async authenticate() {
        await this.client.authenticate();
    }

    async get_game() {
        this.game = this.client.getGame(this.game_ref)
        await this.game.getFullUniverse()
    }

    async get_message() {
        const {diplomacy, events} = await this.game.getUnreadCount()
        this.event_messages = (await this.game.getEventMessages(events)).messages;
        return this.event_messages
    }

    get_money(): number {
        return this.game.currentUniverse.players[this.game.currentUniverse.player_uid].cash;
    }

    // buy 1 science on a specific star
    async buy_science(star: Star, max_money: number) {
        if (Client.get_cost(star).sciCost < max_money) {
            await this.game.buyScience(star.uid.toString(), max_money)
            return true
        }
        return false
    }

    // the key is the stars id
    get_player_owned_stars(): { [key: string]: Star } {
        return this.game.currentUniverse.stars
    }

    private static get_cost(star: Star): { econCost: number, indusCost: number, sciCost: number } {
        return {
            econCost: Math.floor((2.5 * (star.e + 1)) / (star.r / 100)),
            indusCost: Math.floor((5 * (star.i + 1)) / (star.r / 100)),
            sciCost: Math.floor((20 * (star.s + 1)) / (star.r / 100)),
        }
    }
}