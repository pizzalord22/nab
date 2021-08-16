import {TritonClient, TritonGame} from "ts-triton";
import {CronJob} from "cron";

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

function getCosts(stars: Star[], game: TritonGame) {
    return stars.filter(s => s.puid === game.currentUniverse.player_uid).map(star => {
        return {
            econCost: Math.floor((2.5 * 1 * (star.e + 1)) / (star.r / 100)),
            indusCost: Math.floor((5 * 1 * (star.i + 1)) / (star.r / 100)),
            sciCost: Math.floor((20 * 1 * (star.s + 1)) / (star.r / 100)),
            star
        }
    })
}

// @ts-ignore
export async function init() {
    const tritonClient = new TritonClient('username@gmail.com', 'password');
    if (await tritonClient.authenticate()) {
        const cronJob = new CronJob('* * * * *', async function () {
            for (let gameRef of (await tritonClient.getServer().getPlayer()).open_games) {
                const id = gameRef.number;
                const game = tritonClient.getGame(id);
                await game.getFullUniverse();
                const {diplomacy, events} = await game.getUnreadCount();
                const eventMessages = (await game.getEventMessages(events)).messages;
                for (let event of eventMessages.reverse()) {
                    const payload = event.payload;
                    let message;
                    switch (payload.template) {
                        /*case 'tech_up': {
                            message = `Breakthrough made in ${payload.tech} during tick ${payload.tick}. New level: ${payload.level}`;
                            break;
                        }*/
                        case 'production_new': {
                            message = `Production cycle passed for tick ${payload.tick}. Gained ${payload.economy} from econ and ${payload.banking} from banking.\n` +
                                `${payload.tech_name} went up by ${payload.tech_points}`;

                            const totalMoney = game.currentUniverse.players[game.currentUniverse.player_uid].cash;
                            const scienceCut = totalMoney * .3;
                            const indusCut = totalMoney * .2;

                            let scienceBought = 0;
                            let industryBought = 0;
                            let econBought = 0;

                            let currentScienceSpent = 0;
                            while (currentScienceSpent <= scienceCut) {
                                await game.getFullUniverse();
                                const costs = getCosts(Object.values(game.currentUniverse.stars), game)
                                    .sort((s1, s2) => s1.sciCost - s2.sciCost)
                                const toBuy = costs[0];
                                if (toBuy.sciCost + currentScienceSpent > scienceCut) {
                                    break;
                                }
                                await game.buyScience(toBuy.star.uid.toString(), toBuy.sciCost);
                                currentScienceSpent += toBuy.sciCost;
                                scienceBought++;
                            }

                            let currentIndusSpent = 0;
                            while (currentIndusSpent <= indusCut) {
                                await game.getFullUniverse();
                                const costs = getCosts(Object.values(game.currentUniverse.stars), game)
                                    .sort((s1, s2) => s1.indusCost - s2.indusCost)
                                const toBuy = costs[0];
                                if (toBuy.indusCost + currentIndusSpent > indusCut) {
                                    break;
                                }
                                await game.buyIndustry(toBuy.star.uid.toString(), toBuy.indusCost);
                                currentIndusSpent += toBuy.indusCost;
                                industryBought++;
                            }

                            await game.getFullUniverse();
                            let moneyLeft = game.currentUniverse.players[game.currentUniverse.player_uid].cash;
                            while (moneyLeft) {
                                const costs = getCosts(Object.values(game.currentUniverse.stars), game)
                                    .sort((s1, s2) => s1.econCost - s2.econCost)
                                const toBuy = costs[0];
                                if (toBuy.econCost > moneyLeft) {
                                    break;
                                }
                                await game.buyEconomy(toBuy.star.uid.toString(), toBuy.econCost);
                                econBought++;
                                await game.getFullUniverse();
                                moneyLeft = game.currentUniverse.players[game.currentUniverse.player_uid].cash;
                            }

                            console.log(message);
                            console.log(`Bought ${econBought}|${industryBought}|${scienceBought} in tick ${payload.tick}`);
                            console.log('\n');

                            break;
                        }
                        /*case 'money_sent': {
                            if(payload.from_puid === game.currentUniverse.player_uid) {
                                message = `Sent $${payload.amount} to \`${game.currentUniverse.players[payload.to_puid].alias}\``
                            }
                            else {
                                message = `Received $${payload.amount} from \`${game.currentUniverse.players[payload.from_puid].alias}\``
                            }
                            break;
                        }
                        case 'shared_technology': {
                            if(payload.from_puid === game.currentUniverse.player_uid) {
                                message = `Sent ${payload.name} to \`${game.currentUniverse.players[payload.to_puid].alias}\``
                            }
                            else {
                                message = `Received ${payload.name} from \`${game.currentUniverse.players[payload.from_puid].alias}\``
                            }
                            break;
                        }
                        case 'goodbye_to_player_inactivity': {
                            message = `Player \`${payload.name}\` kicked for inactivity.`
                            break;
                        }
                        default: {
                            message = `Unknown payload: \`\`\`json\n${JSON.stringify(payload, null, 2)}\`\`\``
                        }*/
                    }
                    //await channel.send(`${message}\n<https://np.ironhelmet.com/game/${id}>`)
                    await game.readMessage(event.key);
                }
            }
        }, null, true, 'America/New_York', null, true)
    }
}

(async () => {
    await init()
})()