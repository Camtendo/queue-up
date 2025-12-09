
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { LandingPage } from './components/LandingPage';
import { CreateArena } from './components/CreateArena';
import { JoinArena } from './components/JoinArena';
import { Arena } from './components/Arena';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreateArena />} />
        <Route path="/join" element={<JoinArena />} />
        <Route path="/arena/:id" element={<Arena />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
