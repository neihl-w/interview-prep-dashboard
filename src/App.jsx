import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Home from './views/Home';
import LeetCode from './views/LeetCode';
import SystemDesign from './views/SystemDesign';
import Behavioral from './views/Behavioral';
import Settings from './views/Settings';

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leetcode" element={<LeetCode />} />
          <Route path="/system-design" element={<SystemDesign />} />
          <Route path="/behavioral" element={<Behavioral />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
