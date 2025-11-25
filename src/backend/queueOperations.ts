import type { Player, Queue } from "../types/queueTypes";

export function addPlayerToQueue(player: Player, queue: Queue): Queue {
    if (queue.players.some(p => p.id === player.id)) {
        return queue;
    }

    queue.players.push(player);

    return queue;
}

export function removePlayerFromQueue(player: Player, queue: Queue): Queue {
    var existingPlayerIndex = queue.players.findIndex( p => p.id === player.id);

    if (existingPlayerIndex !== -1) {
        queue.players.splice(existingPlayerIndex, 1);
    }

    return queue;
}

export function enqueueNextMatch(queue: Queue, losingPlayerIds: Set<string>) {
    const isSingles = queue.queueMode === 'singles';
    const isDoubles = queue.queueMode === 'doubles';

    // Not enough players, do nothing
    if (!queue.players.length
        || !losingPlayerIds.size
        || (isSingles && queue.players.length < 2) 
        || (isDoubles && queue.players.length < 4)) {
        return queue;
    }

    // For each losing player, move them to the back of the line
    const unaffected:Player[] = [];
    const losers:Player[] = [];
    
    for (const player of queue.players) {
        if (losingPlayerIds.has(player.id)) {
            losers.push(player);
        } else {
            unaffected.push(player);
        }
    }

    return {
        ...queue,
        players: [...unaffected, ...losers]
    };
}