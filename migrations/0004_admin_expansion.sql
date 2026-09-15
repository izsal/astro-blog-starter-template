-- Migration 0004: Admin Expansion - Media Library, Revisions, Settings, and Post Enhancements

-- 1. Media Library Table
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
    size_bytes INTEGER DEFAULT 0,
    alt_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Post Revisions Table
CREATE TABLE IF NOT EXISTS post_revisions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    revision_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 3. Settings Key-Value Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Safe Alter Table for Posts
ALTER TABLE posts ADD COLUMN focus_keyword TEXT;
ALTER TABLE posts ADD COLUMN search_intent TEXT DEFAULT 'Informational';
ALTER TABLE posts ADD COLUMN seo_score INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN featured INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN scheduled_at DATETIME;
ALTER TABLE posts ADD COLUMN is_trashed INTEGER DEFAULT 0;

-- 5. Seed Initial Settings
INSERT OR IGNORE INTO settings (key, value) VALUES
('site_name', 'Qblog'),
('site_url', 'https://qblog.qwarts.my.id'),
('author_name', 'qwarts/ aka iqa'),
('author_role', 'Fullstack & Mobile Developer'),
('default_lang', 'id-ID'),
('timezone', 'Asia/Jakarta'),
('default_meta_desc', 'Personal Knowledge Hub & Developer Portfolio oleh qwarts/ aka iqa.'),
('github_url', 'https://github.com/izsal'),
('linkedin_url', 'https://www.linkedin.com/in/izsal-qurlinas-afandi-983614165/');

-- 6. Seed Sample Media
INSERT OR IGNORE INTO media (id, filename, url, mime_type, size_bytes, alt_text) VALUES
('med-1', 'blog-placeholder-1.jpg', '/blog-placeholder-1.jpg', 'image/jpeg', 142000, 'Cloudflare D1 Architecture Diagram'),
('med-2', 'blog-placeholder-2.jpg', '/blog-placeholder-2.jpg', 'image/jpeg', 185000, 'Docker Compose Microservices Setup'),
('med-3', 'blog-placeholder-3.jpg', '/blog-placeholder-3.jpg', 'image/jpeg', 210000, 'Astro 5 Islands Performance Benchmark'),
('med-4', 'blog-placeholder-about.jpg', '/blog-placeholder-about.jpg', 'image/jpeg', 160000, 'Developer Workspace Setup');
