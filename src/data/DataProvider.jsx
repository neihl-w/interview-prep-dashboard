import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadConfig, isConfigured } from '../lib/config';
import { loadData, saveData, emptyDoc } from '../lib/storage';
import { newId } from '../lib/id';

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

function normalizeDoc(obj) {
  const o = obj && typeof obj === 'object' ? obj : {};
  return {
    version: 1,
    leetcode: Array.isArray(o.leetcode) ? o.leetcode : [],
    systemDesign: Array.isArray(o.systemDesign) ? o.systemDesign : [],
    behavioral: Array.isArray(o.behavioral) ? o.behavioral : [],
  };
}

export function DataProvider({ children }) {
  const [doc, setDoc] = useState(emptyDoc());
  const [sha, setSha] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const configured = isConfigured(loadConfig());

  const reload = useCallback(async () => {
    if (!isConfigured(loadConfig())) { setStatus('idle'); return; }
    setStatus('loading'); setError(null);
    try {
      const res = await loadData(loadConfig());
      setDoc(normalizeDoc(res.doc));
      setSha(res.sha);
      setStatus('ready');
      setLoaded(true);
    } catch (e) {
      setError(String(e.message || e));
      setStatus('error');
      setLoaded(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const persist = useCallback(async (nextDoc) => {
    setDoc(nextDoc);
    if (!isConfigured(loadConfig())) return;
    if (!loaded) {
      setError('Load failed — click Reload before saving your changes.');
      setStatus('error');
      return;
    }
    setStatus('saving'); setError(null);
    try {
      const newSha = await saveData(loadConfig(), nextDoc, sha);
      setSha(newSha);
      setStatus('ready');
    } catch (e) {
      if (e.code === 'conflict') {
        setError('Data changed on GitHub since load. Click Reload, then redo your change.');
      } else {
        setError(String(e.message || e));
      }
      setStatus('error');
    }
  }, [sha, loaded]);

  const mutate = (key, next) => persist({ ...doc, [key]: next });

  const api = {
    doc, status, error, configured,
    reload,
    saveNow: () => persist(doc),
    addProblem: (p) => mutate('leetcode', [...doc.leetcode, { id: newId(), createdAt: Date.now(), ...p }]),
    updateProblem: (id, patch) => mutate('leetcode', doc.leetcode.map((it) => it.id === id ? { ...it, ...patch } : it)),
    deleteProblem: (id) => mutate('leetcode', doc.leetcode.filter((it) => it.id !== id)),
    addNote: (n) => mutate('systemDesign', [...doc.systemDesign, { id: newId(), ...n }]),
    updateNote: (id, patch) => mutate('systemDesign', doc.systemDesign.map((it) => it.id === id ? { ...it, ...patch } : it)),
    deleteNote: (id) => mutate('systemDesign', doc.systemDesign.filter((it) => it.id !== id)),
    addStory: (s) => mutate('behavioral', [...doc.behavioral, { id: newId(), ...s }]),
    updateStory: (id, patch) => mutate('behavioral', doc.behavioral.map((it) => it.id === id ? { ...it, ...patch } : it)),
    deleteStory: (id) => mutate('behavioral', doc.behavioral.filter((it) => it.id !== id)),
    importDoc: (obj) => persist(normalizeDoc(obj)),
    exportDoc: () => doc,
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
