
import { useState } from 'react';
import type { Queue, QueueMode } from '../../types/queueTypes';
import { dequeuePlayer, startMatch, randomizeQueue, setMode } from '../api/client';

interface QueueManagerProps {
    queue: Queue;
    onQueueUpdate: (queue: Queue) => void;
}

export function QueueManager({ queue, onQueueUpdate }: QueueManagerProps) {
    const [selectedLosers, setSelectedLosers] = useState<Set<string>>(new Set());

    const isSingles = queue.queueMode === 'singles';
    const matchSize = isSingles ? 2 : 4;

    const currentMatch = queue.players.slice(0, matchSize);
    const nextInLine = queue.players.slice(matchSize);

    const handleRemove = async (playerId: string) => {
        if (!confirm('Remove player from queue?')) return;
        try {
            const updated = await dequeuePlayer(queue.id, playerId);
            onQueueUpdate(updated);
        } catch (err) {
            console.error(err);
            alert('Failed to remove player');
        }
    };

    const toggleLoser = (playerId: string) => {
        const newLosers = new Set(selectedLosers);
        if (newLosers.has(playerId)) {
            newLosers.delete(playerId);
        } else {
            newLosers.add(playerId);
        }
        setSelectedLosers(newLosers);
    };

    const handleFinishMatch = async () => {
        if (selectedLosers.size === 0) {
            alert('Select at least one loser');
            return;
        }
        try {
            const updated = await startMatch(queue.id, Array.from(selectedLosers));
            onQueueUpdate(updated);
            setSelectedLosers(new Set());
        } catch (err) {
            console.error(err);
            alert('Failed to finish match');
        }
    };

    const handleShuffle = async () => {
        if (!confirm('Shuffle queue?')) return;
        try {
            const updated = await randomizeQueue(queue.id);
            onQueueUpdate(updated);
        } catch (err) {
            console.error(err);
            alert('Failed to shuffle');
        }
    };

    const handleModeChange = async (mode: QueueMode) => {
        try {
            const updated = await setMode(queue.id, mode);
            onQueueUpdate(updated);
        } catch (err) {
            console.error(err);
            alert('Failed to change mode');
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label>
                    <input
                        type="radio"
                        checked={queue.queueMode === 'singles'}
                        onChange={() => handleModeChange('singles')}
                    /> Singles
                </label>
                <label>
                    <input
                        type="radio"
                        checked={queue.queueMode === 'doubles'}
                        onChange={() => handleModeChange('doubles')}
                    /> Doubles
                </label>
                <button onClick={handleShuffle} style={{ marginLeft: 'auto' }}>Shuffle Queue</button>
            </div>

            <h3>Current Match</h3>
            {currentMatch.length === 0 ? <p>No match in progress</p> : (
                <div style={{ marginBottom: '20px', border: '1px solid #444', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                        {currentMatch.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px' }}>
                                <span>{p.name}</span>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedLosers.has(p.id)}
                                        onChange={() => toggleLoser(p.id)}
                                    />
                                    Loser
                                </label>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleFinishMatch}
                        disabled={selectedLosers.size === 0}
                        style={{ marginTop: '10px', width: '100%', backgroundColor: selectedLosers.size > 0 ? '#646cff' : '#555' }}
                    >
                        Finish Match & Rotation
                    </button>
                </div>
            )}

            <h3>Next in Line</h3>
            {nextInLine.length === 0 ? <p>Queue is empty</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '8px', borderBottom: '1px solid #444' }}>#</th>
                            <th style={{ padding: '8px', borderBottom: '1px solid #444' }}>Name</th>
                            <th style={{ padding: '8px', borderBottom: '1px solid #444' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nextInLine.map((p, i) => (
                            <tr key={p.id}>
                                <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{i + 1}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>{p.name}</td>
                                <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                                    <button
                                        onClick={() => handleRemove(p.id)}
                                        style={{ padding: '4px 8px', fontSize: '0.8em', backgroundColor: '#ff4444' }}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
