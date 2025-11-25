import type { Player, Queue } from "./queueTypes";

export type ServerState = {
    rooms?: {[roomId: string]: Queue};
    players?: {[playerId: string]: Player}
}