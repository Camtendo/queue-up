
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <h1 className="title">qUp</h1>

            <div className="landing-actions">
                <button
                    onClick={() => navigate('/create')}
                    className="btn btn-primary btn-large"
                >
                    Create Arena
                </button>

                <div className="divider">or</div>

                <button
                    onClick={() => navigate('/join')}
                    className="btn btn-secondary btn-large"
                >
                    Join Arena
                </button>
            </div>
        </div>
    );
}
