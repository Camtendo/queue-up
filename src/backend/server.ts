import express from 'express';
import { createServer } from 'node:http';
import { promises as fs } from "fs";
import type { ConfigType } from '../types/configTypes';
import path from 'path';
import type { Queue } from '../types/queueTypes';
import type { ServerState } from '../types/serverTypes';
const __dirname = import.meta.dirname;

const app = express();
const server = createServer(app);
const config: ConfigType = await JSON.parse(await fs.readFile("config.json", "utf-8"));

let serverState: ServerState = {};

const initializeServerState = () => {
    console.log('Initializing server state...');
    // TODO Read from database, otherwise do nothing
};

const staticPath = path.join(__dirname, "/../../dist")
app.use('/', express.static(staticPath));

app.get('api/addPlayer', (request, response) => {
    // TODO Write to database instead
    if (!serverState.players) {
        serverState.players = {};
    }

    // serverState.players[request.data] = 
});

server.listen(config.port, () => {
    initializeServerState();
    console.log(`Queue Up app started and listening on ${config.port}`);
});