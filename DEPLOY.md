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
- [ ] Register the site in Google Search Console and submit `https://<domain>/sitemap.xml`
  (`robots.txt` and the sitemap pick up the domain from `DOMAIN` automatically)
- [ ] Pin `connect-src` in `frontend/nginx.conf` to the real domain instead of `https:`
- [ ] Add the Sentry DSN if error tracking is wanted
- [ ] Set up an uptime monitor (for example UptimeRobot, free) on `https://<domain>/api/health`.
  It returns 200 when the API and database are working and 503 when the database is down.
  Docker also uses it to mark the API container healthy or unhealthy.
- [ ] Set up the off-server copy of backups (below) and test a restore once

## Updating the site
```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```
Database changes are applied automatically at start-up (`alembic upgrade`).

## Backups
The `backup` service makes a database backup when the stack starts and then every 24 hours,
into the `backups/` folder next to this file (`savitha-YYYY-MM-DD-HHMM.dump`). Files older than
`BACKUP_KEEP_DAYS` (default 14) are deleted automatically. Tested 2026-10-08: backup written and
restored into a fresh database with all data intact.

- [ ] **Copy backups OFF the server.** A backup on the same machine is lost if the server is.
  For example a daily `rclone copy backups/ <cloud-remote>:savitha-backups` from cron, or download
  them regularly. Where they go is a CEO decision (see CEO_REVIEW_LIST.md, section D).
- Check it is working: `docker compose -f docker-compose.prod.yml logs backup`
- **Restore** (replaces the live data, so take a fresh backup first):
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production exec backup     pg_restore --clean --if-exists -h db -U savitha -d savitha /backups/<file>.dump
  ```

## Useful commands
- Logs: `docker compose -f docker-compose.prod.yml logs -f backend`
- Status: `docker compose -f docker-compose.prod.yml ps`
- Restart: `docker compose -f docker-compose.prod.yml restart`

## Notes
- The API docs pages (`/docs`) are not exposed publicly on purpose.
- `docker-compose.yml` (no `.prod`) is the development database only. The two use separate
  project names, so they never share data.
- Secrets live only in `.env.production`, which is git-ignored. Never commit it.
