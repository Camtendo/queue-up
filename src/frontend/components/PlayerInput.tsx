
import { useState } from 'react';
import { addPlayer, enqueuePlayer } from '../api/client';
import type { Queue } from '../../types/queueTypes';

interface PlayerInputProps {
    queueId: string;
    onQueueUpdate: (queue: Queue) => void;
}

export function PlayerInput({ queueId, onQueueUpdate }: PlayerInputProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const player = await addPlayer(name);
            const updatedQueue = await enqueuePlayer(queueId, player.id);
            onQueueUpdate(updatedQueue);
            setName('');
        } catch (err) {
            console.error(err);
            alert('Failed to add player');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name"
                disabled={loading}
                style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    flex: 1
                }}
            />
            <button
                type="submit"
                disabled={loading || !name.trim()}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#646cff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {loading ? 'Adding...' : 'Add Player'}
            </button>
        </form>
    );
}
