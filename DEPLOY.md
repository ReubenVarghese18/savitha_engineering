# Deploying the Savitha Engineering website

The whole site runs from one server with Docker: HTTPS front door (Caddy), the website,
the API and a PostgreSQL database. Caddy gets and renews the HTTPS certificate on its own.
This setup was tested locally on 2026-10-08 (build, start-up on an empty database, admin login,
sitemap, deep links, HSTS header).

## Before you start (business decisions, see CEO_REVIEW_LIST.md, section D)
- [ ] Domain bought (and DNS access available)
- [ ] A server chosen: a small Linux VM with 2 GB RAM, 20 GB disk, Docker installed
- [ ] Email service chosen for quote alerts (any SMTP provider) and the alert recipients
- [ ] Admin password changed from the old one (it is shared today)

## First deploy
1. **DNS:** point an `A` record for the domain (and `www`) at the server's IP address.
2. **Firewall:** allow ports 80 and 443 (and 22 for SSH only). Do NOT open 5432.
3. **Copy the project** to the server (`git clone`), then in the project folder:
   ```bash
   cp .env.production.example .env.production
   ```
   Fill it in. Generate `SECRET_KEY` and `POSTGRES_PASSWORD` with
   `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Set `DOMAIN` to the bare domain
   (for example `example.com`, no `https://`).
4. **Start everything:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```
   The API creates the database tables itself on first start (`backend/prestart.py`).
5. **Load the product catalogue** (the new database starts empty). From the project's `backend/`
   folder on the dev PC, with the dev `catalog.db` present, and the server's database temporarily
   reachable (SSH tunnel to port 5432, never open it publicly):
   ```bash
   python migrate_sqlite_to_postgres.py --target postgresql://savitha:<POSTGRES_PASSWORD>@localhost:5432/savitha
   ```
   It refuses to run if the target already has rows. Skip test quotes with `--skip-quote-name`.
6. **Check:** open `https://<domain>`, `/products`, `/sitemap.xml`, then sign in at `/admin/login`.
   Send a test quote and confirm the alert email arrives.

## After the domain is live
- [ ] Replace the domain in `frontend/public/robots.txt` (Sitemap line) and rebuild
- [ ] Pin `connect-src` in `frontend/nginx.conf` to the real domain instead of `https:`
- [ ] Add the Sentry DSN if error tracking is wanted
- [ ] Turn on automatic backups (below) and test a restore once

## Updating the site
```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```
Database changes are applied automatically at start-up (`alembic upgrade`).

## Backups
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec db \
  pg_dump -U savitha --format=custom savitha > savitha-$(date +%F).dump
```
Run it daily from cron and copy the file OFF the server (another machine or cloud storage).
Restore to a new database with `pg_restore`.

## Useful commands
- Logs: `docker compose -f docker-compose.prod.yml logs -f backend`
- Status: `docker compose -f docker-compose.prod.yml ps`
- Restart: `docker compose -f docker-compose.prod.yml restart`

## Notes
- The API docs pages (`/docs`) are not exposed publicly on purpose.
- `docker-compose.yml` (no `.prod`) is the development database only. The two use separate
  project names, so they never share data.
- Secrets live only in `.env.production`, which is git-ignored. Never commit it.
