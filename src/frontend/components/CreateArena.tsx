
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QueueMode } from '../../types/queueTypes';
import { fetchLatestQueue, setMode } from '../api/client'; // Using existing APIs for now, effectively forcing a new session/cleanup if we were real.
// Note: In a real app we'd create a NEW queue. Here we reuse the single queue instance for simplicity or rely on server to give us a fresh one if we ask. 
// Actually, fetchLatestQueue gets the existing one. 
// For "Create", let's assume we just use the existing one and update it, or maybe we should add a 'create' API?
// The current server logic gets "latest queue" or creates one. 
// For now, "Create" will just fetch the latest and reset it/enter it.
// To match the behavior of "creating" a new one, we might want to clear it? 
// The user just wants the UI. Let's redirect to Arena after "creating".

export function CreateArena() {
    const navigate = useNavigate();
    const [arenaId] = useState(() => crypto.randomUUID().split('-')[0].toUpperCase()); // Mock ID for display if we needed to generate one client side, but we use server's.
    const [mode, setQueueMode] = useState<QueueMode>('singles');

    const handleCreate = async () => {
        try {
            // In this demo, we'll fetch the single shared queue and update it.
            const queue = await fetchLatestQueue();

            // Set mode
            if (queue.queueMode !== mode) {
                await setMode(queue.id, mode);
            }

            // Navigate to arena
            navigate(`/arena/${queue.id}`);
        } catch (e) {
            console.error(e);
            alert('Failed to create arena');
        }
    };

    return (
        <div className="page-container">
            <h1 className="title">qUp</h1>
            <h2 className="subtitle">Create Arena</h2>

            <div className="form-group">
                <label>Arena ID</label>
                <input type="text" value={arenaId} disabled className="input disabled" />
                {/* Visual only, actual ID comes from server */}
            </div>

            <div className="form-group">
                <label>Versus Mode</label>
                <div className="toggle-group">
                    <button
                        className={`toggle-btn ${mode === 'singles' ? 'active' : ''}`}
                        onClick={() => setQueueMode('singles')}
                    >
                        Singles
                    </button>
                    <button
                        className={`toggle-btn ${mode === 'doubles' ? 'active' : ''}`}
                        onClick={() => setQueueMode('doubles')}
                    >
                        Doubles
                    </button>
                </div>
            </div>

            <button onClick={handleCreate} className="btn btn-primary btn-full top-spacing">
                Create &rarr;
            </button>
        </div>
    );
}

