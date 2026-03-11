# Cloudflare Hosting (Tunnel)

This API is exposed through Cloudflare using `cloudflared` tunnel.

## Live URL (Quick Tunnel)

Current public URL:

`https://repeated-timber-harper-wolf.trycloudflare.com`

Health check:

`https://repeated-timber-harper-wolf.trycloudflare.com/api/health`

Note: quick tunnels are temporary and not production-stable.

## Production Setup (Named Tunnel)

1. In Cloudflare Zero Trust, create a **Named Tunnel**.
2. Add a Public Hostname:
   - Hostname: `api.<your-domain>`
   - Service type: `HTTP`
   - URL: `http://localhost:3001`
3. Copy the generated tunnel token.
4. Set token on server:
   - PowerShell (current session):
     - `$env:CLOUDFLARE_TUNNEL_TOKEN="<your-token>"`
   - Persisted for future sessions:
     - `setx CLOUDFLARE_TUNNEL_TOKEN "<your-token>"`
5. Start API:
   - `npm run build`
   - `npm start`
6. Start named tunnel:
   - `npm run cloudflare:named`

## Quick Tunnel Command

If you only need a temporary URL:

- `npm run cloudflare:quick`

## Optional Hardening

For production on Cloudflare dashboard:

- Enable WAF managed rules.
- Add rate limiting rules for auth endpoints.
- Restrict `/api-docs` by IP or Cloudflare Access policy.
- Set strict CORS origin to your frontend domain.
