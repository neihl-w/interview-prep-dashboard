const KEYS = {
  token: 'ipd.token',
  owner: 'ipd.owner',
  repo: 'ipd.repo',
  branch: 'ipd.branch',
  path: 'ipd.path',
};

export function loadConfig() {
  return {
    token: localStorage.getItem(KEYS.token) || '',
    owner: localStorage.getItem(KEYS.owner) || '',
    repo: localStorage.getItem(KEYS.repo) || '',
    branch: localStorage.getItem(KEYS.branch) || 'main',
    path: localStorage.getItem(KEYS.path) || 'data.json',
  };
}

export function saveConfig(cfg) {
  localStorage.setItem(KEYS.token, cfg.token || '');
  localStorage.setItem(KEYS.owner, cfg.owner || '');
  localStorage.setItem(KEYS.repo, cfg.repo || '');
  localStorage.setItem(KEYS.branch, cfg.branch || 'main');
  localStorage.setItem(KEYS.path, cfg.path || 'data.json');
}

export function clearToken() {
  localStorage.removeItem(KEYS.token);
}

export function isConfigured(cfg) {
  return Boolean(cfg.token && cfg.owner && cfg.repo);
}
