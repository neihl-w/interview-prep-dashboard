const API = 'https://api.github.com';

export function emptyDoc() {
  return { version: 1, leetcode: [], systemDesign: [], behavioral: [] };
}

export function encodeContent(obj) {
  const json = JSON.stringify(obj, null, 2);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function decodeContent(base64) {
  const binary = atob(base64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

function contentsUrl(cfg) {
  return `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}`;
}

function headers(cfg) {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export async function loadData(cfg) {
  const url = `${contentsUrl(cfg)}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await fetch(url, { headers: headers(cfg) });
  if (res.status === 404) return { doc: emptyDoc(), sha: null };
  if (!res.ok) throw new Error(`Load failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return { doc: decodeContent(json.content), sha: json.sha };
}

export async function saveData(cfg, doc, sha) {
  const body = {
    message: `Update ${cfg.path} @ ${new Date().toISOString()}`,
    content: encodeContent(doc),
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(contentsUrl(cfg), {
    method: 'PUT',
    headers: headers(cfg),
    body: JSON.stringify(body),
  });
  if (res.status === 409) {
    const e = new Error('Data changed on GitHub since it was loaded.');
    e.code = 'conflict';
    throw e;
  }
  if (!res.ok) throw new Error(`Save failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.content.sha;
}
