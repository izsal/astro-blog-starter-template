-- D1 SQLite Initial Migration: Schema & Initial Seed Data

-- Table: Post Views & Reactions
CREATE TABLE IF NOT EXISTS post_views (
  slug TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Projects Portfolio
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT NOT NULL,
  github_url TEXT,
  live_url TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Web Development',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Knowledge Hub Snippets / TIL (Today I Learned)
CREATE TABLE IF NOT EXISTS snippets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  code_snippet TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Subscribers / Inquiries
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Projects
INSERT OR IGNORE INTO projects (slug, title, description, tech_stack, github_url, live_url, featured, category)
VALUES
(
  'cloud-edge-api',
  'Cloud Edge Analytics API',
  'High-throughput analytics ingestion engine built on Cloudflare Workers and D1 database with sub-millisecond response latency.',
  '["Cloudflare Workers", "TypeScript", "D1 SQLite", "Hono"]',
  'https://github.com/qwarts/cloud-edge-api',
  'https://qblog.qwarts.my.id',
  1,
  'Backend & Cloud'
),
(
  'astro-knowledge-hub',
  'Personal Knowledge Hub & Digital Garden',
  'Modern developer blog and knowledge management system built with Astro 5, SSR Cloudflare adapter, and tailored content clusters.',
  '["Astro", "TypeScript", "Tailwind CSS", "Cloudflare"]',
  'https://github.com/qwarts/astro-blog-starter-template',
  'https://qblog.qwarts.my.id',
  1,
  'Fullstack'
),
(
  'docker-homelab-infra',
  'Automated Homelab & Microservice Cluster',
  'Production-ready Docker Compose infrastructure with automated Traefik reverse proxy, SSL certs, Prometheus and Grafana monitoring.',
  '["Docker", "Linux", "Traefik", "Bash", "Prometheus"]',
  'https://github.com/qwarts/docker-homelab-infra',
  NULL,
  1,
  'DevOps & Linux'
);

-- Seed Initial Knowledge Snippets (TIL)
INSERT OR IGNORE INTO snippets (slug, title, category, summary, code_snippet)
VALUES
(
  'cloudflare-d1-batch-queries',
  'Cloudflare D1 Atomic Transactions using Batch API',
  'Cloudflare',
  'How to run atomic batch queries in Cloudflare D1 to eliminate round-trip overhead and maintain data consistency.',
  'const [views, info] = await db.batch([
  db.prepare("UPDATE post_views SET views = views + 1 WHERE slug = ?").bind(slug),
  db.prepare("SELECT views, likes FROM post_views WHERE slug = ?").bind(slug)
]);'
),
(
  'docker-compose-healthcheck',
  'Robust Docker Service Dependency with condition: service_healthy',
  'Docker',
  'Ensure database containers are fully ready before launching dependent application services in Docker Compose.',
  'services:
  web:
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 5s
      timeout: 5s
      retries: 5'
),
(
  'astro-on-demand-ssr-island',
  'Selective SSR in Astro 5 with export const prerender = false',
  'Astro',
  'Make dynamic API endpoints or specific dynamic pages on-demand rendered while keeping the rest static.',
  '// src/pages/api/views/[slug].ts
export const prerender = false;

export async function GET({ params, locals }) {
  const db = locals.runtime.env["my-binding"];
  // Query D1 directly at the edge
}'
);
