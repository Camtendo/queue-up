import express from 'express';
import { createServer } from 'node:http';
import { promises as fs } from "fs";
import type { ConfigType } from '../types/configTypes';
import path from 'path';
const __dirname = import.meta.dirname;

const app = express();
const server = createServer(app);
const config: ConfigType = await JSON.parse(await fs.readFile("config.json", "utf-8"));
console.log(config);

const staticPath = path.join(__dirname, "/../../dist")
console.log(staticPath);
app.use('/', express.static(staticPath));

server.listen(config.port, () => {
    console.log(`Queue Up app started and listening on ${config.port}`);
})