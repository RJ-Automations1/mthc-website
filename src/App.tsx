import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import History from './pages/History';
import Schedule from './pages/Schedule';
import Donate from './pages/Donate';
import Leaderboard from './pages/Leaderboard';
import BoardMembers from './pages/BoardMembers';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/history" element={<History />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/board" element={<BoardMembers />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
