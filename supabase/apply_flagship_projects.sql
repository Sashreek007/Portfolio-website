-- Adds the two flagship projects and re-orders the grid.
-- Idempotent: safe to run more than once. Matched on name, so the existing
-- rows keep their UUIDs and anything referencing them (posts.project_id).
--
-- Run in the Supabase SQL editor for project sashreek-addanki.

BEGIN;

-- 1. Columns ---------------------------------------------------------------
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_gallery_is_array;
ALTER TABLE projects
  ADD CONSTRAINT projects_gallery_is_array
  CHECK (jsonb_typeof(gallery) = 'array');
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS highlights TEXT[] NOT NULL DEFAULT '{}';

-- 2. Push the existing projects down so 0 and 1 are free -------------------
UPDATE projects SET sort_order = 2 WHERE name = 'Career Co-Pilot';
UPDATE projects SET sort_order = 3 WHERE name = 'DoomScroller';
UPDATE projects SET sort_order = 4 WHERE name = 'FluxAtlas — Economic Trading Engine';
UPDATE projects SET sort_order = 5 WHERE name = 'Spam Detection Discord Bot';
UPDATE projects SET sort_order = 6 WHERE name = 'Balloon Popper — Gesture-Controlled Game';
UPDATE projects SET sort_order = 7 WHERE name = 'LinkedIn Profile Summarizer';
UPDATE projects SET sort_order = 8 WHERE name = 'ClubMate AI';

-- 3. The two flagship projects --------------------------------------------

INSERT INTO projects (name, description, sort_order)
SELECT 'Incident Diagnosis Engine (Replay)', 'A Java 25 / Spring Boot service that diagnoses why a production service broke: it walks the trace-derived service dependency graph to find what the failure could have touched, detects when it started (CUSUM change-point), ranks suspect change events against that moment, then returns a ranked cause where every claim cites a real telemetry signal.', 0
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Incident Diagnosis Engine (Replay)');

UPDATE projects SET
  description = 'A Java 25 / Spring Boot service that diagnoses why a production service broke: it walks the trace-derived service dependency graph to find what the failure could have touched, detects when it started (CUSUM change-point), ranks suspect change events against that moment, then returns a ranked cause where every claim cites a real telemetry signal.',
  github_url  = 'https://github.com/Sashreek007/Replay',
  demo_url    = NULL,
  image_url   = '/projects/replay/walkthrough-poster.jpg',
  video_url   = '/projects/replay/walkthrough.mp4',
  gallery     = '[{"url":"/projects/replay/architecture.webp","caption":"System architecture","alt":"Pipeline diagram. An alert webhook is accepted with a 202 and the pipeline runs off-thread. Telemetry from Prometheus, Tempo and Loki stays inside the user''s network. Four deterministic stages run with no model involved — Narrow (trace spans to a BFS radius), When (CUSUM change point), Suspects (causal window and score) and Gather (templating and budget, 2,000 lines down to 15 ids) — producing an evidence packet of about 15 signals under 8,000 tokens. That packet feeds the single model call, then a grounding gate strips any cited id that does not resolve, yielding an incident report of ranked causes with checkable citations."},{"url":"/projects/replay/narrow.webp","caption":"Blast radius: what the failure could have touched","alt":"Diagram titled ''Narrow — the blast radius''. Trace spans from Tempo listing calls such as web to checkout and checkout to payments are turned into a service call graph. The alerted service, web, is highlighted, and a breadth-first walk expands through checkout, payments, inventory and db to produce a blast radius of size 5."},{"url":"/projects/replay/when.webp","caption":"Change-point detection: when it started","alt":"Diagram titled ''When — when did it actually start?''. A latency chart shows a flat baseline over its first third, then a step change; the detector walks back from the alarm to the last empty bucket to mark onset. Below it a CUSUM score chart crosses a threshold of 5 for three sustained samples. A side panel lists the control-chart parameters, with sigma estimated from median absolute deviation rather than the mean."},{"url":"/projects/replay/suspects.webp","caption":"Correlating suspect change events","alt":"Diagram titled ''Suspects — which change explains that moment?''. A timeline marks a causal window before the inflection point, with a 120-second grace band after it; a rollback landing after the inflection is excluded as a response rather than a cause. One panel breaks the score into weighted proximity, scope and corroboration terms, and another shows the resulting ranked candidates, with a deploy 90 seconds before the inflection scoring highest."},{"url":"/projects/replay/gather.webp","caption":"Packing the evidence packet","alt":"Diagram titled ''Gather — the only evidence the model ever sees''. Three steps: bounded retrieval reads a capped number of log lines from Loki once per suspect around the onset anchor; Drain-style templating collapses near-identical log lines into a single template with a count; and a slot budget keeps common and rare shapes under a token ceiling while reserving the top candidate signals from being cut. A footer lists the id prefixes every signal carries, which is what a model claim must cite."},{"url":"/projects/replay/reason.webp","caption":"Reasoning + the grounding gate","alt":"Diagram titled ''Reason — one model call''. The roughly 15-signal evidence packet becomes a prompt in which untrusted text is encoded at every boundary, goes to the model once, and the response passes through a grounding gate that checks whether each cited id actually resolves against the packet."}]'::jsonb,
  highlights  = ARRAY['Four deterministic stages compress ~2,000 log lines per suspect — a 10,000-line ceiling across a five-service blast radius — into a ~15-signal, under-8,000-token evidence packet before a single model call.','A grounding gate drops any model claim whose citations aren''t in that packet, so reports are 100% cited across 20/20 scenarios. CI fails the build below 100%.','A fault-injection eval rig replays 20 injected outages: 5/5 top-3 on bad deploy, config drift and resource exhaustion; 3/5 on dependency failure.','195 JUnit tests and 7 integration suites run against real Postgres and the telemetry stack via Testcontainers.']::text[],
  stack       = ARRAY['Java 25','Spring Boot 4.1','Spring AI 2.0','PostgreSQL 17','Flyway','React 19','TypeScript','OpenTelemetry','Prometheus','Docker','Testcontainers','GitHub Actions']::text[],
  status      = 'shipped',
  year        = 2026,
  is_best     = true,
  is_current  = false,
  sort_order  = 0
WHERE name = 'Incident Diagnosis Engine (Replay)';

INSERT INTO projects (name, description, sort_order)
SELECT 'API Key & Quota Service (mint)', 'A Go service that issues, validates, and meters API keys for backend services. Stateless replicas behind nginx, Redis for caching and token-bucket rate limiting, Postgres as source of truth, with the validate hot path tuned to keep Postgres out of it.', 1
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'API Key & Quota Service (mint)');

UPDATE projects SET
  description = 'A Go service that issues, validates, and meters API keys for backend services. Stateless replicas behind nginx, Redis for caching and token-bucket rate limiting, Postgres as source of truth, with the validate hot path tuned to keep Postgres out of it.',
  github_url  = 'https://github.com/Sashreek007/mint',
  demo_url    = NULL,
  image_url   = '/projects/mint/architecture.webp',
  video_url   = NULL,
  gallery     = '[{"url":"/projects/mint/grafana-overview.webp","caption":"Service dashboard under load","alt":"Grafana service dashboard for mint captured during a load test, showing request rate, latency percentiles, cache hit rate and error panels across the two keyservice replicas."},{"url":"/projects/mint/grafana-tenants.webp","caption":"Per-tenant quota and usage","alt":"Grafana per-tenant dashboard for mint, breaking request volume, quota consumption and rate-limit rejections out by individual tenant."}]'::jsonb,
  highlights  = ARRAY['A three-tier cache — in-process, then Redis, then Postgres — with pub/sub invalidation, holding a 99.7% hit rate.','One atomic Lua script does the rate limit, quota check and metering in a single Redis round-trip.','Redis counters plus a leader-lease batch flusher hold database writes to a load-invariant ~10 writes/s.','Benchmarked with committed, reproducible load tests, Prometheus and Grafana dashboards, and integration tests against real Postgres and Redis via Testcontainers.']::text[],
  stack       = ARRAY['Go','Redis','PostgreSQL','Lua','nginx','Docker','Prometheus','Grafana','Testcontainers']::text[],
  status      = 'shipped',
  year        = 2026,
  is_best     = true,
  is_current  = false,
  sort_order  = 1
WHERE name = 'API Key & Quota Service (mint)';

COMMIT;

-- Check:
-- SELECT sort_order, name, jsonb_array_length(gallery) AS figures,
--        array_length(highlights, 1) AS highlights
-- FROM projects ORDER BY sort_order;
