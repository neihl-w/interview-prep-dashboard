import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../data/DataProvider';
import { statusFor, sortProblems } from '../lib/status';
import { todayISO } from '../lib/dates';

function overdueLabel(s) {
  if (s.status === 'due') return 'Due today';
  return `${Math.abs(s.dayDelta)}d overdue`;
}

export default function Home() {
  const { doc } = useData();
  const today = todayISO();

  const dueList = useMemo(() =>
    sortProblems(doc.leetcode, today)
      .map((p) => ({ p, s: statusFor(p.resolveDate, today) }))
      .filter((x) => x.s.status === 'overdue' || x.s.status === 'due'),
    [doc.leetcode, today]);

  return (
    <div className="view">
      <h1>Home</h1>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>
          LeetCode re-visit board {dueList.length > 0 && <span className="badge overdue">{dueList.length}</span>}
        </h2>
        {dueList.length === 0 ? (
          <p className="muted">Nothing due right now. Nice.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {dueList.map(({ p, s }) => (
              <li key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className={'badge ' + s.status}>{overdueLabel(s)}</span>
                <span style={{ flex: 1 }}>
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.name}</a> : p.name}
                  {p.pattern && <span className="muted"> · {p.pattern}</span>}
                </span>
                <Link to="/leetcode">Open</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="cards">
        <Link className="card" to="/leetcode">
          <h3>LeetCode</h3>
          <p>{doc.leetcode.length} problems tracked</p>
        </Link>
        <Link className="card" to="/system-design">
          <h3>System Design</h3>
          <p>{doc.systemDesign.length} notes</p>
        </Link>
        <Link className="card" to="/behavioral">
          <h3>Behavioral</h3>
          <p>{doc.behavioral.length} stories</p>
        </Link>
      </div>
    </div>
  );
}
