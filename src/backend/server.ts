import express from 'express';
import { createServer } from 'node:http';
import { promises as fs } from "fs";
import type { ConfigType } from '../types/configTypes';
import path from 'path';
import type { Queue, QueueMode } from '../types/queueTypes';
import type { ServerState } from '../types/serverTypes';
import { addPlayerToQueue, enqueueNextMatch, randomizeQueue, removePlayerFromQueue, reorderQueue } from './queueOperations.js';
const __dirname = import.meta.dirname;

const app = express();
const server = createServer(app);
const config: ConfigType = await JSON.parse(await fs.readFile("config.json", "utf-8"));

let serverState: ServerState = {};

const initializeServerState = () => {
    console.log('Initializing server state...');
    // Create first queue with arbitrary UUID
    const queueId = crypto.randomUUID();
    const queue: Queue = {
        queueMode: 'singles',
        players: [],
        id: queueId
    };
    updateServerRoom(queueId, queue);
};

const updateServerRoom = (queueId: string, queue: Queue) => {
    if (!queueId) {
        return;
    }

    if (!serverState.rooms) {
        serverState.rooms = {};
    }

    serverState.rooms[queueId] = queue;
};

const getServerRoom = (queueId: string) => {
    return serverState.rooms?.[queueId];
};

const staticPath = path.join(__dirname, "/../../dist")
app.use('/', express.static(staticPath));
app.use(express.json());

app.post('/api/enqueuePlayer', (request, response) => {
    if (!serverState.players) {
        serverState.players = {};
    }

    const playerId: string = request.query.playerId as string;
    const queueId: string = request.query.queueId as string;

    let queue = getServerRoom(queueId);

    if (!queue) {
        queue = {
            queueMode: 'singles',
            players: [],
            id: queueId
        };
    }

    const player = serverState.players?.[playerId];

    if (!player) {
        return response.status(400).send("Invalid player ID");
    }

    const updatedQueue = addPlayerToQueue(player, queue);
    updateServerRoom(queueId, updatedQueue);

    response.send(updatedQueue);
});

app.post('/api/dequeuePlayer', (request, response) => {
    const queueId: string = request.query.queueId as string;
    const queue = getServerRoom(queueId);

    if (!queue) {
        return response.status(400).send("Invalid queue ID");
    }

    const playerId: string = request.query.playerId as string;
    const player = queue.players.find(p => p.id === playerId);

    if (!player) {
        return response.status(400).send("Invalid player ID");
    }

    const updatedQueue = removePlayerFromQueue(player, queue);
    updateServerRoom(queueId, updatedQueue);
    response.send(updatedQueue);
});

app.post('/api/setMode', (request, response) => {
    const queueId: string = request.query.queueId as string;
    const queue = getServerRoom(queueId);

    if (!queue) {
        return response.status(400).send("Invalid queue ID");
    }

    const mode: QueueMode = request.query.mode as QueueMode;
    queue.queueMode = mode;
    updateServerRoom(queueId, queue);
    response.send(queue);
});

app.post('/api/randomizeQueue', (request, response) => {
    const queueId: string = request.query.queueId as string;
    const queue = getServerRoom(queueId);

    if (!queue) {
        return response.status(400).send("Invalid queue ID");
    }

    const updatedQueue = randomizeQueue(queue);
    updateServerRoom(queueId, updatedQueue);
    response.send(updatedQueue);
});

app.post('/api/reorderQueue', (request, response) => {
    const queueId: string = request.body.queueId;
    const playerIds: string[] = request.body.playerIds;
    const queue = getServerRoom(queueId);

    if (!queue) {
        return response.status(400).send("Invalid queue ID");
    }

    const updatedQueue = reorderQueue(queue, playerIds);
    updateServerRoom(queueId, updatedQueue);
    response.send(updatedQueue);
});

// Add player to server state
app.post('/api/addPlayer', (request, response) => {
    if (!serverState.players) {
        serverState.players = {};
    }

    const playerName: string = request.query.playerName as string;
    const player = {
        id: crypto.randomUUID(),
        name: playerName
    };

    serverState.players[player.id] = player;
    response.send(player);
});

app.post('/api/startMatch', (request, response) => {
    const queueId: string = request.query.queueId as string;
    const queue = getServerRoom(queueId);

    if (!queue) {
        return response.status(400).send("Invalid queue ID");
    }

    const updatedQueue = enqueueNextMatch(queue, new Set(request.body.losingPlayerIds));
    updateServerRoom(queueId, updatedQueue);
    response.send(updatedQueue);
});

app.get('/api/queue', (request, response) => {
    const queueId: string = request.query.queueId as string;
    const queue = getServerRoom(queueId);
    response.send(queue);
});

app.get('/api/players', (_, response) => {
    const players = serverState.players;
    response.send(players);
});


app.get('/api/latest-queue', (_, response) => {
    const queueIds = Object.keys(serverState.rooms || {});
    if (queueIds.length > 0) {
        return response.send(serverState.rooms![queueIds[0]]);
    }

    // Create new if none exists
    const queueId = crypto.randomUUID();
    const queue: Queue = {
        queueMode: 'singles',
        players: [],
        id: queueId
    };
    updateServerRoom(queueId, queue);
    response.send(queue);
});

server.listen(config.port, () => {
    initializeServerState();
    console.log(`Queue Up app started and listening on ${config.port}`);
});