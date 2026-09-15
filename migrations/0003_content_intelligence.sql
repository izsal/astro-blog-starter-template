-- Migration 0003: Content Intelligence, Keywords, Devlogs, and Writing Goals

-- 1. Keywords Tracking
CREATE TABLE IF NOT EXISTS keywords (
    id TEXT PRIMARY KEY,
    keyword TEXT NOT NULL UNIQUE,
    intent TEXT NOT NULL DEFAULT 'Informational',
    target_post_id TEXT,
    target_position INTEGER DEFAULT 10,
    current_position INTEGER DEFAULT 15,
    impressions INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Opportunity',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Devlogs (Developer Journal)
CREATE TABLE IF NOT EXISTS devlogs (
    id TEXT PRIMARY KEY,
    entry_date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Writing Goals & Editorial Targets
CREATE TABLE IF NOT EXISTS writing_goals (
    id TEXT PRIMARY KEY,
    month_year TEXT NOT NULL UNIQUE,
    target_count INTEGER NOT NULL DEFAULT 4,
    completed_count INTEGER NOT NULL DEFAULT 3,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Keywords (Content Intelligence Opportunities)
INSERT OR IGNORE INTO keywords (id, keyword, intent, target_position, current_position, impressions, status) VALUES
('kw-1', 'astro cloudflare', 'Tutorial', 5, 11, 1284, 'Top Opportunity'),
('kw-2', 'cloudflare d1 tutorial', 'Technical Guide', 10, 18, 950, 'Opportunity'),
('kw-3', 'docker homelab microservices', 'Architecture', 8, 14, 820, 'Top Opportunity'),
('kw-4', 'astro ssr edge latency', 'Informational', 10, 22, 610, 'Growing'),
('kw-5', 'sqlite fts5 full text search', 'Code Implementation', 5, 12, 540, 'Opportunity');

-- Seed Devlogs (Real Developer Progress)
INSERT OR IGNORE INTO devlogs (id, entry_date, title, content, tags) VALUES
(
    'devlog-1',
    '2026-09-15',
    'Membangun Content Intelligence & D1 SQLite Database',
    'Hari ini menyelesaikan skema relasional Cloudflare D1 untuk artikel, kategori, tags, dan content series. Mengintegrasikan Content Command Center agar blog memiliki kecerdasan SEO mandiri.',
    '["Cloudflare D1", "Astro 5", "Architecture"]'
),
(
    'devlog-2',
    '2026-09-12',
    'Optimasi Cold Start dan Edge Caching di Cloudflare Workers',
    'Mengevaluasi latensi edge serverless. Menggunakan sub-request caching dan merestrukturisasi database queries menggunakan batch D1 API untuk performa sub-50ms.',
    '["Edge Computing", "Performance", "Cloudflare"]'
),
(
    'devlog-3',
    '2026-09-08',
    'Setup Homelab Traefik Reverse Proxy & Automated SSL',
    'Mengonfigurasi Traefik v3 dengan Docker provider. Otomasi sertifikat Let''s Encrypt via DNS challenge Cloudflare untuk seluruh domain internal homelab.',
    '["Docker", "Traefik", "Homelab"]'
);

-- Seed Initial Writing Goal
INSERT OR IGNORE INTO writing_goals (id, month_year, target_count, completed_count) VALUES
('goal-2026-09', 'September 2026', 4, 3);
