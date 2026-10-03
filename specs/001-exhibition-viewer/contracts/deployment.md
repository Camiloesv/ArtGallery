# Deployment Contract

Cloudflare Pages hosts the static Vite build. Codio remains the live development environment.

| Git source | Host environment | Required behavior |
|---|---|---|
| `staging` | Cloudflare Pages preview | Each push updates the shared staging preview. |
| `main` | Cloudflare Pages production | Deploy only after instructor acceptance and fast-forward promotion. |
| Other branches | No automatic preview | Excluded by the Pages preview branch controls. |

## Build

- Build command: `npm run build`.
- Build output directory: `dist`.
- Production branch: `main`.
- Preview branch inclusion: `staging` only; exclude other branches.
- Staging and production use the same repository configuration and content. No environment-specific
  exhibition values are introduced.

## Promotion and verification

- A push to `staging` is the submission and preview trigger.
- The instructor promotes the accepted staging commit to `main` by fast-forward only.
- Verify the deployed commit identifiers and rendered content in both environments before claiming
  that promotion preserved the staging-equals-production guarantee.
- Project name, Cloudflare account, custom domains, and credentials are provisioned outside this
  contract and must not be invented in repository documentation.
