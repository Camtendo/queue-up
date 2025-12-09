
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Lock } from 'lucide-react';

import { fetchLatestQueue, reorderQueue, randomizeQueue, startMatch, addPlayer, enqueuePlayer, dequeuePlayer, setMode } from '../api/client';
import type { Queue, Player } from '../../types/queueTypes';
import { SortablePlayer } from './SortablePlayer';
import { Timer } from './Timer';

export function Arena() {
    const { id } = useParams<{ id: string }>();
    const [queue, setQueue] = useState<Queue | null>(null);
    const [newPlayerName, setNewPlayerName] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        // Poll for updates (simple version of realtime)
        const fetchQ = () => {
            fetchLatestQueue().then(setQueue).catch(console.error);
        };
        fetchQ();
        const interval = setInterval(fetchQ, 2000);
        return () => clearInterval(interval);
    }, [id]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!queue) return;
        if (!over) return;
        if (active.id === over.id) return;

        // "Drag to Replace" logic:
        // Everything is in one large list `queue.players`.
        // Indices 0..MatchSize-1 are "In Match".
        // Indices MatchSize..End are "In Queue".
        // dragging from Queue to Match (or vice versa) triggers a swap/move 
        // which effectively replaces the player in the match if we target a match spot.

        const oldIndex = queue.players.findIndex(p => p.id === active.id);
        const newIndex = queue.players.findIndex(p => p.id === over.id);

        const newPlayers = arrayMove(queue.players, oldIndex, newIndex);

        // Optimistic update
        setQueue({ ...queue, players: newPlayers });

        // If the top N players changed, the "match" effectively changed or we just swapped someone in.
        // It's just a reorder.
        try {
            await reorderQueue(queue.id, newPlayers.map(p => p.id));
        } catch (e) {
            console.error("Reorder failed", e);
        }
    };

    const handleRandomize = async () => {
        if (!queue) return;
        const q = await randomizeQueue(queue.id);
        setQueue(q);
    };

    const handleMatchFinish = async (winningTeamPlayers: Player[]) => {
        if (!queue) return;
        const isDoubles = queue.queueMode === 'doubles';
        const matchSize = isDoubles ? 4 : 2;
        const matchPlayers = queue.players.slice(0, matchSize);

        const winningIds = new Set(winningTeamPlayers.map(p => p.id));
        const losers = matchPlayers.filter(p => !winningIds.has(p.id));

        try {
            const q = await startMatch(queue.id, losers.map(p => p.id));
            setQueue(q);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddPlayer = async () => {
        if (!queue || !newPlayerName.trim()) return;
        try {
            const player = await addPlayer(newPlayerName);
            const q = await enqueuePlayer(queue.id, player.id);
            setQueue(q);
            setNewPlayerName('');
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemovePlayer = async (playerId: string) => {
        if (!queue) return;
        try {
            const newPlayers = queue.players.filter(p => p.id !== playerId);
            setQueue({ ...queue, players: newPlayers });
            await dequeuePlayer(queue.id, playerId);
        } catch (e) {
            console.error("Remove failed", e);
        }
    };

    const handleSetMode = async (mode: 'singles' | 'doubles') => {
        if (!queue) return;
        try {
            const q = await setMode(queue.id, mode);
            setQueue(q);
        } catch (e) {
            console.error(e);
        }
    }

    if (!queue) return <div className="loading">Loading Arena...</div>;

    // Derived state
    const isDoubles = queue.queueMode === 'doubles';
    const matchSize = isDoubles ? 4 : 2;
    const matchPlayers = queue.players.slice(0, matchSize);
    const waitingPlayers = queue.players.slice(matchSize);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={queue.players}
                strategy={verticalListSortingStrategy}
            >
                <div className="arena-container">
                    <header className="arena-header">
                        <div className="arena-id">
                            <Lock size={16} /> <span>{queue.id.substring(0, 5).toUpperCase()}</span>
                        </div>
                        <div className="arena-controls">
                            <div className="mode-toggle">
                                <button
                                    className={`toggle-btn-small ${!isDoubles ? 'active' : ''}`}
                                    onClick={() => handleSetMode('singles')}
                                >
                                    1v1
                                </button>
                                <button
                                    className={`toggle-btn-small ${isDoubles ? 'active' : ''}`}
                                    onClick={() => handleSetMode('doubles')}
                                >
                                    2v2
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Match Area */}
                    <div className="match-area">
                        <div className="match-timer-container">
                            <Timer startTime={queue.matchStartedAt} />
                        </div>

                        <div className="team team-left" onClick={() => handleMatchFinish(matchPlayers.slice(0, matchSize / 2))}>
                            {matchPlayers.slice(0, matchSize / 2).map(p => (
                                <SortableCircle key={p.id} player={p} />
                            ))}
                            <div className="winner-label">Winner</div>
                        </div>
                        <div className="vs-badge">VS</div>
                        <div className="team team-right" onClick={() => handleMatchFinish(matchPlayers.slice(matchSize / 2, matchSize))}>
                            {matchPlayers.slice(matchSize / 2, matchSize).map(p => (
                                <SortableCircle key={p.id} player={p} />
                            ))}
                            <div className="winner-label">Winner</div>
                        </div>
                    </div>

                    {/* Queue Controls */}
                    <div className="queue-controls">
                        <div className="add-player-form">
                            <input
                                value={newPlayerName}
                                onChange={e => setNewPlayerName(e.target.value)}
                                placeholder="Add Player..."
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleAddPlayer();
                                }}
                            />
                            <button onClick={handleAddPlayer}>+</button>
                        </div>
                        <button className="randomize-btn" onClick={handleRandomize} title="Randomize Queue">
                            🎲
                        </button>
                    </div>

                    {/* Queue List (Draggable) */}
                    <div className="queue-list-container">
                        <div className="queue-list">
                            {waitingPlayers.map(p => (
                                <SortablePlayer key={p.id} player={p} onRemove={handleRemovePlayer} />
                            ))}
                            {waitingPlayers.length === 0 && (
                                <div className="empty-queue-msg">Queue is empty</div>
                            )}
                        </div>
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}

// Inline SortableCircle to avoid file jumping
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCircle({ player }: { player: Player }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: player.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="player-circle">
            {player.name}
        </div>
    );
}
