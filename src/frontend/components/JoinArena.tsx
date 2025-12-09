
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLatestQueue } from '../api/client';

export function JoinArena() {
    const navigate = useNavigate();
    const [arenaId, setArenaId] = useState('');

    const handleJoin = async () => {
        // For demo, ignore input ID and join the default one
        try {
            const queue = await fetchLatestQueue();
            navigate(`/arena/${queue.id}`);
        } catch (e) {
            console.error(e);
            alert("Could not join arena");
        }
    };


    return (
        <div className="page-container">
            <h1 className="title">qUp</h1>
            <h2 className="subtitle">Join Arena</h2>

            <div className="form-group">
                <label>Arena ID</label>
                <input
                    type="text"
                    value={arenaId}
                    onChange={e => setArenaId(e.target.value)}
                    className="input"
                />
            </div>

            <button onClick={handleJoin} className="btn btn-primary btn-full top-spacing">
                Join &rarr;
            </button>
        </div>
    );
}
