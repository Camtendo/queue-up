import type { Player, Queue } from "../types/queueTypes";

export function addPlayerToQueue(player: Player, queue: Queue): Queue {
    // Check if player is already in queue
    if (queue.players.some(p => p.id === player.id)) {
        return queue;
    }

    queue.players.push(player);

    return queue;
}

export function removePlayerFromQueue(player: Player, queue: Queue): Queue {
    var existingPlayerIndex = queue.players.findIndex(p => p.id === player.id);

    if (existingPlayerIndex !== -1) {
        queue.players.splice(existingPlayerIndex, 1);
    }

    return queue;
}

export function reorderQueue(queue: Queue, playerIds: string[]): Queue {
    // Create map for fast lookup
    const playerMap = new Map(queue.players.map(p => [p.id, p]));

    // Reconstruct list based on new order, keeping only players that exist in current queue
    // This allows reordering while ignoring players that might have left or invalid IDs
    const newPlayers: Player[] = [];
    const processedIds = new Set<string>();

    for (const id of playerIds) {
        if (playerMap.has(id)) {
            newPlayers.push(playerMap.get(id)!);
            processedIds.add(id);
        }
    }

    // Append any players that are in the queue but weren't in the new order list (safety fallback)
    for (const player of queue.players) {
        if (!processedIds.has(player.id)) {
            newPlayers.push(player);
        }
    }

    return {
        ...queue,
        players: newPlayers,
        matchStartedAt: new Date(),
    };
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
    // The winners stay at the front (implied by not moving them)
    // Wait, typical "winner stays on" logic implies winners stay at front (indices 0,1 etc)
    // and losers go to back.
    // The current queue logic seems to separate them into "unaffected" and "losers".
    // "Unaffected" includes winners AND people waiting in line.

    // Actually, "Winner stays on" usually means:
    // Match players are at the top of the queue.
    // Losers move to bottom.
    // Winners stay at top? Or do they rotate?
    // In casual "King of the Hill", winners stay.
    // If winners stay, they should remain at the head of the list.

    const unaffected: Player[] = [];
    const losers: Player[] = [];

    for (const player of queue.players) {
        if (losingPlayerIds.has(player.id)) {
            losers.push(player);
        } else {
            unaffected.push(player);
        }
    }

    return {
        ...queue,
        players: [...unaffected, ...losers],
        matchStartedAt: new Date(),
    };
}

export function randomizeQueue(queue: Queue) {
    if (!queue.players.length) {
        return queue;
    }

    queue.players.sort(() => Math.random() - 0.5);

    return queue;
}