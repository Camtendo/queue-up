export type Queue = {
    id: string;
    queueMode: QueueMode;
    players: Player[];
    matchStartedAt?: Date;
}

export type Player = {
    id: string;
    name: string;
}

export type QueueMode = 'singles' | 'doubles';