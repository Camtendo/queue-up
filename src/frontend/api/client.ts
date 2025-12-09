
import type { Player, Queue, QueueMode } from "../../types/queueTypes";

export async function fetchLatestQueue(): Promise<Queue> {
    const res = await fetch('/api/latest-queue');
    if (!res.ok) throw new Error('Failed to fetch queue');
    return res.json();
}

export async function fetchPlayers(): Promise<Record<string, Player>> {
    const res = await fetch('/api/players');
    if (!res.ok) throw new Error('Failed to fetch players');
    return res.json();
}

export async function addPlayer(name: string): Promise<Player> {
    const res = await fetch(`/api/addPlayer?playerName=${encodeURIComponent(name)}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to add player');
    return res.json();
}

export async function enqueuePlayer(queueId: string, playerId: string): Promise<Queue> {
    const res = await fetch(`/api/enqueuePlayer?queueId=${queueId}&playerId=${playerId}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to enqueue player');
    return res.json();
}

export async function dequeuePlayer(queueId: string, playerId: string): Promise<Queue> {
    const res = await fetch(`/api/dequeuePlayer?queueId=${queueId}&playerId=${playerId}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to dequeue player');
    return res.json();
}

export async function startMatch(queueId: string, losingPlayerIds: string[]): Promise<Queue> {
    const res = await fetch(`/api/startMatch?queueId=${queueId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ losingPlayerIds: Array.from(losingPlayerIds) }) // Start match expects Set but JSON is array, backend handles? Checked backend: it expects { losingPlayerIds: Set } ? No, backend is JSON.parse? Express body parser?
        // Wait, looking at server.ts: app.post('api/startMatch', ... request.body.losingPlayerIds ...
        // queueOperations: enqueueNextMatch(queue, losingPlayerIds: Set<string>)
        // Express by default doesn't convert array to set. I likely need to send array and have backend handle it, or backend expects array and manually converts.
        // Let's re-read backend.
    });
    if (!res.ok) throw new Error('Failed to start match');
    return res.json();
}

export async function randomizeQueue(queueId: string): Promise<Queue> {
    const res = await fetch(`/api/randomizeQueue?queueId=${queueId}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to randomize queue');
    return res.json();
}


export async function reorderQueue(queueId: string, playerIds: string[]): Promise<Queue> {
    const res = await fetch(`/api/reorderQueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId, playerIds })
    });
    if (!res.ok) throw new Error('Failed to reorder queue');
    return res.json();
}

export async function setMode(queueId: string, mode: QueueMode): Promise<Queue> {

    const res = await fetch(`/api/setMode?queueId=${queueId}&mode=${mode}`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to set mode');
    return res.json();
}
