-- Full PRD Schema Migration for Cloudflare D1
-- Conforms to PRD Sections 31 & 32

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Posts
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    og_image TEXT,
    reading_time INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 4. Tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);

-- 5. Post Tags Pivot
CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 6. Post Categories Pivot
CREATE TABLE IF NOT EXISTS post_categories (
    post_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 7. Series
CREATE TABLE IF NOT EXISTS series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
);

-- 8. Series Posts Pivot
CREATE TABLE IF NOT EXISTS series_posts (
    series_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (series_id, post_id),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 9. Redirects
CREATE TABLE IF NOT EXISTS redirects (
    id TEXT PRIMARY KEY,
    from_path TEXT NOT NULL UNIQUE,
    to_path TEXT NOT NULL,
    status_code INTEGER DEFAULT 301,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INITIAL SEED DATA ACCORDING TO PRD
-- ============================================================================

-- Seed Categories (PRD Section 14)
INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
('cat-1', 'Development', 'development', 'General software development, coding best practices, and engineering principles.'),
('cat-2', 'Frontend', 'frontend', 'Modern frontend frameworks including Astro, React, TypeScript, and performance optimization.'),
('cat-3', 'Backend', 'backend', 'Server architectures, microservices, FastAPI, Node.js, and database design.'),
('cat-4', 'DevOps', 'devops', 'Docker containers, CI/CD pipelines, Linux environments, and homelab setups.'),
('cat-5', 'Cloud', 'cloud', 'Cloudflare Workers, D1 SQLite, edge computing, serverless architectures, and CDN.');

-- Seed Tags (PRD Section 15)
INSERT OR IGNORE INTO tags (id, name, slug) VALUES
('tag-astro', 'Astro', 'astro'),
('tag-cloudflare', 'Cloudflare', 'cloudflare'),
('tag-typescript', 'TypeScript', 'typescript'),
('tag-react', 'React', 'react'),
('tag-docker', 'Docker', 'docker'),
('tag-linux', 'Linux', 'linux'),
('tag-laravel', 'Laravel', 'laravel'),
('tag-fastapi', 'FastAPI', 'fastapi'),
('tag-vue', 'Vue', 'vue');

-- Seed Series (PRD Section 13 & 40/41)
INSERT OR IGNORE INTO series (id, title, slug, description) VALUES
('ser-astro-cf', 'Astro + Cloudflare Mastery', 'astro-cloudflare', 'Panduan end-to-end membangun blog, edge API, dan database D1 berkinerja tinggi.'),
('ser-docker-infra', 'Production Microservices with Docker', 'docker-microservices', 'Arsitektur container production-ready, Traefik reverse proxy, dan monitoring.');

-- Seed Sample Posts
INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content, cover_image, status, published_at, seo_title, seo_description, reading_time, views) VALUES
(
    'post-astro-d1',
    'Cara Menggunakan Cloudflare D1 dengan Astro 5',
    'cloudflare-d1-astro-tutorial',
    'Tutorial lengkap menghubungkan Astro 5 SSR ke Cloudflare D1 SQLite database menggunakan binding resmi.',
    '# Panduan Astro + Cloudflare D1\n\nCloudflare D1 adalah database SQL serverless berbasis SQLite yang berjalan langsung di jaringan Cloudflare edge...',
    '/blog-placeholder-1.jpg',
    'PUBLISHED',
    '2026-03-01 08:00:00',
    'Tutorial Cloudflare D1 dengan Astro 5 — Panduan Lengkap',
    'Pelajari cara mengintegrasikan Cloudflare D1 SQLite database ke website Astro 5 secara cepat, aman, dan type-safe.',
    6,
    1240
),
(
    'post-docker-homelab',
    'Membangun Homelab Microservice dengan Docker & Traefik',
    'docker-homelab-microservices',
    'Panduan arsitektur homelab modern menggunakan Docker Compose, Traefik automatic SSL, dan monitoring Prometheus.',
    '# Docker Homelab Architecture\n\nMengembangkan infrastruktur server mandiri menggunakan containerization...',
    '/blog-placeholder-2.jpg',
    'PUBLISHED',
    '2026-03-05 09:30:00',
    'Arsitektur Homelab Modern dengan Docker & Traefik',
    'Setup production-ready homelab dengan automated SSL certs, reverse proxy, dan Prometheus monitoring.',
    8,
    890
);

-- Seed Relations
INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES
('post-astro-d1', 'cat-5'),
('post-docker-homelab', 'cat-4');

INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES
('post-astro-d1', 'tag-astro'),
('post-astro-d1', 'tag-cloudflare'),
('post-astro-d1', 'tag-typescript'),
('post-docker-homelab', 'tag-docker'),
('post-docker-homelab', 'tag-linux');

INSERT OR IGNORE INTO series_posts (series_id, post_id, position) VALUES
('ser-astro-cf', 'post-astro-d1', 1);
