import { Routes, Route, Link } from 'react-router-dom';
import Nav from './components/Nav';
import { useData } from './data/DataProvider';
import Home from './views/Home';
import LeetCode from './views/LeetCode';
import SystemDesign from './views/SystemDesign';
import Behavioral from './views/Behavioral';
import Settings from './views/Settings';

function StatusBar() {
  const { status, error, reload, saveNow, configured } = useData();
  if (!configured) {
    return (
      <div className="statusbar warn">
        Not configured — set up GitHub sync in <Link to="/settings">Settings</Link>.
      </div>
    );
  }
  const label = status === 'saving' ? 'Saving…'
    : status === 'loading' ? 'Loading…'
    : status === 'error' ? 'Error' : 'Synced';
  return (
    <div className={'statusbar' + (error ? ' error' : '')}>
      <span>{label}</span>
      <span className="statusbar-msg">{error || ''}</span>
      <button onClick={reload}>Reload</button>
      <button onClick={saveNow}>Save now</button>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <Nav />
      <StatusBar />
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
