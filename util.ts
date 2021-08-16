class unit {
    ships: number;
    weapons: number;

    constructor(ships: number, weapon: number) {
        this.ships = ships;
        this.weapons = weapon;
    }
}

class combat {
    battleSimulation(defender: unit, attacker: unit): {defender: unit,attacker: unit } {
        let roundToKillDefender = Math.ceil(defender.ships / attacker.weapons)
        let roundToKillAttacker = Math.ceil(attacker.ships / defender.weapons + 1)
        let rounds = Math.min(roundToKillDefender, roundToKillAttacker)
        attacker.ships = Math.max(0, attacker.ships - rounds * (defender.weapons + 1))
        if (roundToKillDefender >= roundToKillAttacker) {
            defender.ships = Math.max(0, defender.ships - rounds * attacker.weapons)
        } else {
            defender.ships = Math.max(0, defender.ships - (rounds - 1) * attacker.weapons)
        }
        return {defender, attacker}
    }

    optimizeDefender(defender: unit, attacker: unit): number {
        for (let x = 0.0; ; x++) {
            defender.ships = x
            if (this.battleSimulation(defender, attacker).attacker.ships === 0) {
                return defender.ships
            }
        }

    }

    supportCalculator(production: number, time_steps: number, defender: unit, attacker: unit): number {
        let unitsNeededForDefender = this.optimizeDefender(defender, attacker)
        return Math.ceil(unitsNeededForDefender - defender.ships - (Math.floor(production * time_steps)))
    }
}
