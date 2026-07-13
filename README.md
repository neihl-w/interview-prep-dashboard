

## One-time setup

2. **Private data repo** — create a **private** repo named `interview-prep-data`. It can
   start empty; the app creates `data.json` on first save.
3. **Token** — create a **fine-grained personal access token** (GitHub → Settings →
   Developer settings → Fine-grained tokens) scoped to **only** `interview-prep-data`,
   with **Repository permissions → Contents: Read and write**. Set an expiration.
4. **Configure** — open the deployed app, go to **Settings**, paste the token and your
   repo owner/name (`interview-prep-data`), and Save & connect. The token lives only in
   this browser's `localStorage`.

## Local development

```bash
npm install
npm run dev     # dev server
npm run test    # unit tests (Vitest)
npm run build   # production build
```

## Security notes

- The public app URL is only code — no secrets. A visitor without your token sees an
  empty, unconfigured app.
- The token is the only sensitive asset; keep it fine-grained + expiring, and use
  **Clear token / sign out** in Settings on shared devices.
