# Small browser case set

| Actor | Route/action | Expected result |
| --- | --- | --- |
| Signed out | Protected URL and mutation | Safe login/denial; no private SSR data |
| Owner | Create, list, edit, search | Only permitted records; clear validation |
| Other user | Owner's detail/download ID | Denial before bytes/counts/snippets |
| Owner | Native POST without JavaScript | Equivalent validated saved state |
| Owner | Empty result / failed request | Useful inline status and retry |
| Keyboard | Form/dialog | Labels, visible focus, Escape and focus return |
| Narrow/zoom | Full task | Readable reflow without hidden primary action |

Use only requested cases. An unexecuted row remains pending. Fake authentication does not prove WorkOS, fake storage does not prove R2, and an in-memory store does not prove Neon transaction isolation.
