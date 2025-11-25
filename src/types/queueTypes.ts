export type Queue = {
    id: string;
    queueMode: QueueMode;
    players: Player[];
}

export type Player = {
    id: string;
    name: string;
}

export type QueueMode = 'singles' | 'doubles';