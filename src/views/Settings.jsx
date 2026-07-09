import { useState } from 'react';
import { loadConfig, saveConfig, clearToken } from '../lib/config';
import { useData } from '../data/DataProvider';

export default function Settings() {
  const { reload } = useData();
  const [cfg, setCfg] = useState(loadConfig());
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => { setCfg({ ...cfg, [k]: e.target.value }); setSaved(false); };

  const onSave = (e) => {
    e.preventDefault();
    saveConfig(cfg);
    setSaved(true);
    reload();
  };

  const onClearToken = () => {
    clearToken();
    setCfg({ ...cfg, token: '' });
    reload();
  };

  return (
    <div className="view">
      <h1>Settings</h1>
      <div className="panel">
        <p className="muted">
          Enter a fine-grained GitHub token scoped to only your private data repo
          (Contents: read/write). It is stored only in this browser's localStorage and is
          never committed.
        </p>
        <form className="form" onSubmit={onSave}>
          <label>Token
            <input type="password" value={cfg.token} onChange={set('token')} placeholder="github_pat_…" autoComplete="off" />
          </label>
          <label>Repo owner
            <input type="text" value={cfg.owner} onChange={set('owner')} placeholder="your-github-username" />
          </label>
          <label>Data repo name
            <input type="text" value={cfg.repo} onChange={set('repo')} placeholder="interview-prep-data" />
          </label>
          <label>Branch
            <input type="text" value={cfg.branch} onChange={set('branch')} placeholder="main" />
          </label>
          <label>File path
            <input type="text" value={cfg.path} onChange={set('path')} placeholder="data.json" />
          </label>
          <div className="form-actions">
            <button type="button" className="danger" onClick={onClearToken}>Clear token / sign out</button>
            <button type="submit" className="primary">Save & connect</button>
          </div>
          {saved && <p className="muted">Saved. Check the status bar above for sync state.</p>}
        </form>
      </div>
    </div>
  );
}
