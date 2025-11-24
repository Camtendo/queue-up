export type Queue = {
    id: string;
    combatantCount: number;
    players?: Player[];
}

export type Player = {
    id: string;
    name: string;
}

export type QueueMode = 'singles' | 'doubles';