# PRD — Personal Blog & Knowledge Hub

**Project:** Personal Blog & Knowledge Hub  
**Domain:** `qblog.qwarts.my.id`  
**Status:** Planning  
**Frontend:** Astro  
**Backend:** Cloudflare Workers  
**Database:** Cloudflare D1  
**Storage:** Cloudflare R2  
**Language:** TypeScript  
**Styling:** Tailwind CSS  

---

# 1. Product Vision

Membangun blog pribadi yang berfungsi sebagai:

- Personal branding
- Developer portfolio
- Knowledge base
- Tempat dokumentasi pembelajaran
- Tempat berbagi tutorial dan pengalaman teknis
- Sumber organic traffic dari search engine

Blog tidak hanya berfungsi sebagai platform untuk menulis artikel, tetapi sebagai **Personal Knowledge Hub** yang memiliki sistem content management, SEO, internal linking, analytics, dan content optimization.

### Core Vision

> "Tempat untuk mendokumentasikan apa yang saya pelajari, apa yang saya bangun, dan membangun personal brand melalui tulisan."

---

# 2. Goals

## Primary Goals

1. Membangun personal branding sebagai developer.
2. Mendapatkan organic traffic dari Google.
3. Mendokumentasikan proses belajar dan development.
4. Menampilkan project yang pernah dibuat.
5. Membuat sistem publishing yang mudah digunakan.
6. Membuat content cluster agar artikel saling terhubung.
7. Membuat fondasi yang mudah dikembangkan.

## Secondary Goals

- Membangun portfolio yang lebih kuat.
- Mendapatkan peluang kerja/freelance.
- Membuat developer profile yang searchable.
- Membuat source of truth untuk pengetahuan teknis pribadi.

---

# 3. Non-Goals

Pada versi awal project tidak akan fokus pada:

- Social network
- Forum
- Sistem komentar custom
- Marketplace
- Multi-author CMS
- Complex newsletter system
- Full analytics platform
- AI-generated article secara otomatis

Fitur tersebut dapat dipertimbangkan pada fase berikutnya.

---

# 4. Target Audience

## Primary Audience

Developer Indonesia yang mencari informasi mengenai:

- JavaScript
- TypeScript
- React
- Astro
- Vue
- Laravel
- FastAPI
- Docker
- Linux
- Cloudflare
- Web development
- Developer tooling

## Secondary Audience

Recruiter atau hiring manager yang ingin melihat:

- Portfolio
- Technical skill
- Project
- Experience
- Problem solving
- Cara berpikir

## Tertiary Audience

Developer pemula yang membutuhkan:

- Tutorial
- Troubleshooting
- Learning roadmap
- Pengalaman nyata developer

---

# 5. Traffic Strategy

Strategi utama traffic adalah:

```text
Search Intent
      ↓
SEO Article
      ↓
Internal Links
      ↓
Related Article
      ↓
Content Series
      ↓
Project
      ↓
Returning Visitor
```

Setiap artikel sebaiknya tidak berdiri sendiri.

Contoh:

```text
Google
   ↓
"Cara deploy Astro ke Cloudflare"
   ↓
Article
   ↓
Astro Series
   ↓
Cloudflare D1 Tutorial
   ↓
Project
   ↓
Portfolio
```

---

# 6. Information Architecture

```text
/
├── blog
│   ├── /blog/[slug]
│   ├── /category/[slug]
│   ├── /tag/[slug]
│   └── /page/[page]
│
├── projects
│   ├── /projects
│   └── /projects/[slug]
│
├── series
│   ├── /series
│   └── /series/[slug]
│
├── about
├── now
├── uses
├── bookmarks
├── search
│
├── rss.xml
├── sitemap.xml
└── robots.txt
```

## Admin

```text
/admin
├── dashboard
├── posts
├── posts/new
├── posts/[id]/edit
├── categories
├── tags
├── series
├── media
├── comments
├── redirects
├── seo
├── analytics
└── settings
```

---

# 7. Core Features

## 7.1 Blog Article

Setiap artikel memiliki metadata:

```text
Title
Slug
Excerpt
Content
Cover Image
Author
Category
Tags
Series
Status
Published At
Updated At
Reading Time

SEO Title
SEO Description
Canonical URL
OG Image
```

### Article Status

```text
DRAFT
SCHEDULED
PUBLISHED
ARCHIVED
```

---

# 8. Article Editor

Content menggunakan Markdown atau MDX.

Contoh:

```md
---
title: "Deploy Astro ke Cloudflare"
description: "Tutorial lengkap deploy Astro ke Cloudflare"
category: "Astro"
tags:
  - astro
  - cloudflare
  - deployment
---

# Deploy Astro ke Cloudflare

Content artikel...
```

Metadata artikel dapat disimpan di D1, sedangkan content dapat disimpan dalam Markdown/MDX.

---

# 9. SEO Features

SEO merupakan salah satu fitur utama.

## Basic SEO

Setiap artikel memiliki:

```text
SEO Title
Meta Description
Canonical URL
Slug
Robots
```

## Social Media

```text
OG Title
OG Description
OG Image
Twitter Card
```

## Structured Data

Generate JSON-LD:

```text
Article
BreadcrumbList
Person
WebSite
WebPage
```

---

# 10. SEO Score

Admin menyediakan SEO checker ketika membuat artikel.

Contoh:

```text
SEO SCORE: 87/100

✓ Title length
✓ Meta description
✓ URL structure
✓ H1 exists
✓ Cover image
✓ Image alt text
✓ Internal links
✓ External links
✓ Word count
✓ Heading structure
✓ Canonical URL
```

Jika terdapat masalah:

```text
SEO SCORE: 72/100

⚠ Meta description terlalu pendek
⚠ Belum memiliki internal link
⚠ Image belum memiliki alt text
```

---

# 11. Internal Linking Engine

Admin dapat memberikan rekomendasi artikel terkait ketika menulis artikel.

Contoh:

```text
Related Articles

→ Apa itu Cloudflare D1?
→ Cara menggunakan D1 dengan Astro
→ Deploy Astro ke Cloudflare
```

Tujuan:

```text
Article A
   ↓
Article B
   ↓
Article C
   ↓
Article D
```

Hal ini membantu:

* SEO
* User navigation
* Page views
* Content discovery
* Topical authority

---

# 12. Related Articles

Di akhir artikel akan ditampilkan:

```text
You might also like

┌──────────────────────────┐
│ Belajar Astro            │
│ 8 min read               │
└──────────────────────────┘

┌──────────────────────────┐
│ Cloudflare D1 Tutorial   │
│ 10 min read              │
└──────────────────────────┘
```

Algoritma awal menggunakan:

```text
Same Category
+
Same Tags
+
Same Series
+
Content Similarity
```

Tidak membutuhkan AI pada MVP.

---

# 13. Content Series

Artikel dapat dikelompokkan menjadi sebuah series.

Contoh:

## Astro + Cloudflare

```text
1. Mengenal Astro
2. Membuat Blog dengan Astro
3. Astro SSR
4. Mengenal Cloudflare D1
5. Astro + D1
6. Authentication
7. Deploy ke Cloudflare
```

Pada halaman artikel:

```text
ASTRO + CLOUDFLARE

✓ Part 1
✓ Part 2
● Part 3
○ Part 4
○ Part 5
```

Tujuan:

* Meningkatkan session duration
* Mendorong pembaca membaca artikel lain
* Membentuk topical authority
* Mempermudah learning path

---

# 14. Categories

Kategori dibuat terbatas dan jelas.

Contoh:

```text
Development
Frontend
Backend
DevOps
Cloud
Career
Personal
Projects
```

Jangan membuat terlalu banyak kategori.

---

# 15. Tags

Tags digunakan untuk klasifikasi yang lebih spesifik.

Contoh:

```text
astro
react
nextjs
typescript
javascript
docker
cloudflare
linux
laravel
fastapi
vue
```

Admin dapat melihat penggunaan tag:

```text
Tag Usage

astro        14
react        21
docker        8
cloudflare    6
laravel       7
```

---

# 16. Search

Search menggunakan Cloudflare D1 + SQLite FTS5.

Tidak menggunakan:

```sql
LIKE '%keyword%'
```

Untuk dataset yang lebih besar, gunakan:

```text
posts_fts
```

Search dapat mencakup:

```text
Title
Description
Content
Tags
Categories
```

Contoh:

```text
Search: "astro"

12 articles found

1. Building Blog with Astro
2. Astro SSR
3. Astro + Cloudflare
4. Astro Content Collections
```

---

# 17. Project Showcase

Blog juga memiliki halaman project.

```text
/projects
```

Contoh:

```text
PennyPenguin

Personal finance application.

Tech:
- Kotlin
- Firebase
- Android

[View Project]
```

## Project Metadata

```text
Title
Slug
Description
Content
Thumbnail
GitHub URL
Demo URL
Tech Stack
Status
Start Date
End Date
Featured
```

---

# 18. Now Page

URL:

```text
/now
```

Berisi apa yang sedang dikerjakan atau dipelajari.

Contoh:

```text
Currently Building

Personal finance application.

Currently Learning

Vue
Astro
Cloudflare

Currently Writing

Frontend development
Docker
Cloudflare
```

Tujuan:

* Personal branding
* Menunjukkan aktivitas
* Membuat website terasa hidup
* Menjadi snapshot perjalanan development

---

# 19. Uses Page

URL:

```text
/uses
```

Contoh:

```text
Hardware

- MacBook Pro M1
- Monitor
- Keyboard

Software

- VS Code
- iTerm
- Docker
- Git

Development

- Astro
- React
- Laravel
- FastAPI
- Cloudflare
```

---

# 20. Bookmarks

URL:

```text
/bookmarks
```

Kategori:

```text
Articles
Tools
Documentation
Repositories
Resources
```

Contoh:

```text
Developer Resources

Astro Documentation
React Documentation
Cloudflare Documentation
Useful GitHub repositories
```

---

# 21. Analytics Dashboard

Admin memiliki dashboard analytics.

```text
Visitors
1,284

Page Views
3,812

Average Reading Time
4m 21s
```

## Top Articles

```text
1. Astro + Cloudflare       812
2. Docker Beginner Guide    431
3. React Performance        298
```

## Traffic Source

```text
Google       72%
Direct       18%
Social        7%
Other         3%
```

---

# 22. Search Console Integration

Admin memiliki SEO dashboard:

```text
Google Search Performance

Clicks
Impressions
CTR
Average Position
```

Contoh:

```text
Keyword Opportunities

"astro cloudflare"
Position: 11

"cloudflare d1 tutorial"
Position: 18

"astro blog tutorial"
Position: 23
```

Data tersebut dapat digunakan untuk menentukan artikel yang perlu diperbaiki.

---

# 23. Content Opportunity

Dashboard memberikan rekomendasi konten.

Contoh:

```text
CONTENT OPPORTUNITIES

"astro cloudflare d1"

Impressions: 1,284
Average Position: 14

Recommendation:

→ Improve existing article
→ Add code example
→ Add 3 internal links
→ Improve meta description
```

Contoh artikel baru:

```text
Potential Article

"Cara menggunakan Cloudflare D1 dengan Astro"

Related articles:

✓ Astro deployment
✓ Cloudflare D1
✓ Astro SSR

Suggested cluster:

Astro + Cloudflare
```

---

# 24. Scheduled Publishing

Admin dapat menjadwalkan artikel.

```text
Publish Date

20 September 2026
08:00
```

Flow:

```text
Draft
   ↓
Schedule
   ↓
Cloudflare Worker / Cron
   ↓
Published
   ↓
Sitemap Updated
```

---

# 25. Sitemap

Sitemap dibuat secara otomatis.

```text
/sitemap.xml
```

Contoh URL:

```text
/blog/article-1
/blog/article-2
/projects/project-1
/series/astro-cloudflare
```

Hanya content yang relevan dan published yang dimasukkan.

---

# 26. RSS

Endpoint:

```text
/rss.xml
```

RSS berisi:

```text
Title
Description
Author
Published Date
URL
```

---

# 27. Comments

Untuk MVP tidak disarankan membuat comment system sendiri.

Gunakan solusi eksternal seperti:

```text
Giscus
```

Alasan:

* Spam protection
* Authentication
* Moderation
* Notification
* Maintenance lebih rendah

---

# 28. Newsletter

Versi awal menggunakan external newsletter provider.

Flow:

```text
Email Input
      ↓
Newsletter Provider
      ↓
Subscriber
```

Admin dapat melihat:

```text
Subscribers
83
```

Sistem email tidak perlu dibangun sendiri pada MVP.

---

# 29. Admin Dashboard

Dashboard utama:

```text
Good morning 👋

Articles
42

Drafts
7

Scheduled
3

Views
12,431
```

## Content

```text
Published     42
Draft          7
Scheduled      3
Archived       2
```

## Traffic

```text
Visitors
Page Views
Top Articles
Search Queries
```

## Content Health

```text
SEO Issues                 4
Broken Links               2
Articles without Links     6
Articles needing update   12
```

---

# 30. Admin Authentication

Admin tidak boleh dapat diakses tanpa authentication.

Flow:

```text
/admin
   ↓
Authentication
   ↓
Session
   ↓
Admin Dashboard
```

Authentication dapat menggunakan authentication provider yang kompatibel dengan Cloudflare.

---

# 31. Database Schema

## users

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## posts

```sql
CREATE TABLE posts (
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
```

---

## categories

```sql
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
);
```

---

## tags

```sql
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);
```

---

## post_tags

```sql
CREATE TABLE post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,

    PRIMARY KEY (post_id, tag_id),

    FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);
```

---

## post_categories

```sql
CREATE TABLE post_categories (
    post_id TEXT NOT NULL,
    category_id TEXT NOT NULL,

    PRIMARY KEY (post_id, category_id),

    FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);
```

---

## series

```sql
CREATE TABLE series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
);
```

---

## series_posts

```sql
CREATE TABLE series_posts (
    series_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    position INTEGER NOT NULL,

    PRIMARY KEY (series_id, post_id),

    FOREIGN KEY (series_id)
        REFERENCES series(id)
        ON DELETE CASCADE,

    FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE
);
```

---

## projects

```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    description TEXT,
    content TEXT,

    thumbnail TEXT,

    github_url TEXT,
    demo_url TEXT,

    tech_stack TEXT,

    status TEXT,

    start_date DATE,
    end_date DATE,

    featured INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## redirects

```sql
CREATE TABLE redirects (
    id TEXT PRIMARY KEY,

    from_path TEXT NOT NULL UNIQUE,
    to_path TEXT NOT NULL,

    status_code INTEGER DEFAULT 301,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

# 32. Full Database Relationship

```text
users

posts
 ├── post_tags ─── tags
 │
 ├── post_categories ─── categories
 │
 └── series_posts ─── series

projects

redirects
```

---

# 33. Astro Architecture

Recommended structure:

```text
src/
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ArticleCard.astro
│   ├── RelatedPosts.astro
│   ├── TableOfContents.astro
│   ├── ReadingProgress.astro
│   └── SEO.astro
│
├── layouts/
│   ├── MainLayout.astro
│   └── ArticleLayout.astro
│
├── pages/
│   ├── index.astro
│   │
│   ├── blog/
│   │   ├── index.astro
│   │   └── [slug].astro
│   │
│   ├── category/
│   │   └── [slug].astro
│   │
│   ├── tag/
│   │   └── [slug].astro
│   │
│   ├── series/
│   │   └── [slug].astro
│   │
│   ├── projects/
│   │   ├── index.astro
│   │   └── [slug].astro
│   │
│   ├── search.astro
│   ├── about.astro
│   ├── now.astro
│   ├── uses.astro
│   └── bookmarks.astro
│
├── lib/
│   ├── db.ts
│   ├── posts.ts
│   ├── categories.ts
│   ├── tags.ts
│   ├── series.ts
│   ├── projects.ts
│   ├── search.ts
│   ├── seo.ts
│   └── analytics.ts
│
└── content/
```

---

# 34. Admin Architecture

```text
src/pages/admin/

├── index.astro
│
├── dashboard/
│   └── index.astro
│
├── posts/
│   ├── index.astro
│   ├── new.astro
│   └── [id]/
│       └── edit.astro
│
├── categories/
│   └── index.astro
│
├── tags/
│   └── index.astro
│
├── series/
│   └── index.astro
│
├── projects/
│   └── index.astro
│
├── media/
│   └── index.astro
│
├── redirects/
│   └── index.astro
│
├── analytics/
│   └── index.astro
│
├── seo/
│   └── index.astro
│
└── settings/
    └── index.astro
```

---

# 35. Cloudflare Architecture

```text
                    Internet
                       │
                       ▼
                   Cloudflare
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
              Astro         Assets
                │
                ▼
           Cloudflare
             Workers
                │
          ┌─────┴─────┐
          │           │
          ▼           ▼
         D1          R2
      Database     Images
          │
          ▼
         FTS5
        Search
```

---

# 36. Storage Strategy

## D1

Digunakan untuk:

* Article metadata
* Categories
* Tags
* Series
* Projects
* Users
* Redirects
* Analytics metadata

## R2

Digunakan untuk:

* Cover images
* Article images
* Project thumbnails
* OpenGraph images
* Media assets

Jangan menyimpan binary image langsung di D1.

---

# 37. URL Structure

Gunakan URL yang pendek dan readable.

## Article

```text
/blog/building-blog-with-astro
```

## Category

```text
/category/astro
```

## Tag

```text
/tag/cloudflare
```

## Series

```text
/series/astro-cloudflare
```

## Project

```text
/projects/pennypenguin
```

Hindari URL seperti:

```text
/blog/2026/09/15/building-blog-with-astro
```

---

# 38. Homepage

Struktur homepage:

```text
Hero
│
├── Introduction
├── Read Blog
└── View Projects
│
├── Featured Articles
│
├── Latest Articles
│
├── Featured Projects
│
├── Topics
│
└── Currently
```

Contoh:

```text
Hi, I'm Izsal 👋

Frontend Developer building things,
learning technology, and documenting
the journey.

[Read Blog] [View Projects]
```

---

# 39. Content Strategy

Blog menggunakan pendekatan:

```text
Pillar
   ↓
Cluster
   ↓
Internal Links
   ↓
Series
```

Jangan membuat artikel secara random.

---

# 40. Content Pillar: Astro

Contoh:

```text
Astro

├── Apa itu Astro?
├── Astro vs Next.js
├── Astro SSR
├── Astro Islands
├── Astro Content Collections
├── Astro + Cloudflare
├── Astro + D1
├── Astro Authentication
├── Deploy Astro
└── Astro Performance
```

---

# 41. Content Pillar: Cloudflare

```text
Cloudflare

├── Cloudflare Workers
├── Cloudflare D1
├── Cloudflare R2
├── Cloudflare KV
├── Cloudflare Pages
├── Astro + Cloudflare
└── Astro + D1
```

---

# 42. Content Pillar: Developer Journey

```text
Developer Journey

├── Cara belajar React
├── Kesalahan frontend developer junior
├── Cara membuat portfolio developer
├── Belajar Docker
├── Membangun SaaS pertama
└── Pengalaman menggunakan teknologi tertentu
```

---

# 43. Content Command Center

Salah satu fitur utama admin.

Dashboard:

```text
CONTENT COMMAND CENTER

Traffic
━━━━━━━━━━━━━━━━━━━━

1,284 Visitors


SEO Opportunities
━━━━━━━━━━━━━━━━━━━━

🔥 Astro + D1
Position: 11
1,240 impressions

🔥 Docker Ubuntu
Position: 14
920 impressions

⚠ React Optimization
Position: 23
640 impressions


Content Health
━━━━━━━━━━━━━━━━━━━━

12 articles need updates

3 articles have no internal links

5 articles have weak descriptions


Recommended Articles
━━━━━━━━━━━━━━━━━━━━

1. Astro + D1 Authentication
2. Deploy Astro D1 to Cloudflare
3. Astro vs Next.js
```

Tujuannya agar admin tidak hanya menjadi tempat CRUD artikel.

Admin menjadi:

> **Content Management + SEO Management System**

---

# 44. KPI

## Traffic

```text
Organic Visitors
Page Views
Returning Visitors
```

## SEO

```text
Impressions
Clicks
CTR
Average Position
Indexed Pages
```

## Content

```text
Articles Published / Month
Articles Updated / Month
Average Reading Time
Internal Links / Article
```

## Conversion

```text
Newsletter Subscribers
GitHub Clicks
Project Views
Contact Clicks
```

---

# 45. Development Roadmap

# Phase 1 — MVP

```text
[ ] Astro setup
[ ] Cloudflare setup
[ ] D1 setup
[ ] Database schema
[ ] D1 repository
[ ] Admin authentication
[ ] Admin dashboard
[ ] CRUD posts
[ ] Markdown editor
[ ] Categories
[ ] Tags
[ ] Blog listing
[ ] Blog detail
[ ] SEO metadata
[ ] Sitemap
[ ] RSS
[ ] Search
[ ] Related articles
[ ] Responsive design
```

---

# Phase 2 — Content System

```text
[ ] Series
[ ] Project showcase
[ ] Table of contents
[ ] Reading time
[ ] Reading progress
[ ] Scheduled publishing
[ ] Redirect manager
[ ] Media management
```

---

# Phase 3 — Growth

```text
[ ] Analytics
[ ] Google Search Console integration
[ ] SEO dashboard
[ ] Content opportunity
[ ] Internal link recommendation
[ ] Content health
[ ] Newsletter
```

---

# Phase 4 — Advanced

```text
[ ] AI article suggestions
[ ] AI internal linking
[ ] AI SEO analysis
[ ] Automatic content clustering
[ ] Advanced analytics
[ ] Comment system
[ ] Multi-author support
```

---

# 46. Feature Priority

## P0 — Critical

```text
Blog
Admin
Authentication
D1
SEO
Sitemap
RSS
Search
Categories
Tags
Related Articles
Responsive UI
```

## P1 — High

```text
Series
Projects
Analytics
Scheduled Publishing
TOC
Reading Progress
Redirects
```

## P2 — Medium

```text
Search Console
Content Opportunity
SEO Audit
Internal Link Recommendation
Newsletter
```

## P3 — Optional

```text
Comments
AI Features
Multi-author
Advanced Analytics
```

---

# 47. Performance Requirements

Target:

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

Prioritas:

* Minimal JavaScript
* Astro islands
* Optimized images
* Lazy loading
* Responsive images
* CDN
* Cloudflare caching
* Minimize client-side hydration

---

# 48. SEO Requirements

Setiap published article harus memiliki:

```text
[ ] Unique title
[ ] Unique description
[ ] Canonical URL
[ ] H1
[ ] Proper heading hierarchy
[ ] Cover image
[ ] Alt text
[ ] Internal links
[ ] Related articles
[ ] Structured data
[ ] OpenGraph
[ ] Sitemap entry
```

---

# 49. Security Requirements

Admin harus:

```text
[ ] Require authentication
[ ] Protect admin routes
[ ] Validate input
[ ] Sanitize content
[ ] Validate file upload
[ ] Restrict media types
[ ] Restrict media size
[ ] Rate limit sensitive endpoints
[ ] Prevent unauthorized mutations
```

---

# 50. Success Criteria

Project dianggap berhasil jika:

### Technical

```text
✓ Astro berjalan di Cloudflare
✓ D1 digunakan sebagai database
✓ R2 digunakan untuk media
✓ Admin dapat mengelola artikel
✓ Public blog dapat membaca artikel
✓ Search bekerja
✓ Sitemap bekerja
✓ RSS bekerja
```

### SEO

```text
✓ Semua artikel memiliki metadata SEO
✓ Structured data tersedia
✓ Internal linking tersedia
✓ Search Console dapat membaca sitemap
✓ URL bersih
```

### Business / Personal Branding

```text
✓ Portfolio tersedia
✓ Project showcase tersedia
✓ Developer profile tersedia
✓ Organic traffic mulai meningkat
✓ Artikel mendapatkan impression dari Google
```

---

# 51. Recommended Final Stack

```text
Frontend
├── Astro
├── TypeScript
├── Tailwind CSS
└── Astro Islands

Backend
└── Cloudflare Workers

Database
└── Cloudflare D1

Storage
└── Cloudflare R2

Search
└── SQLite FTS5

Content
└── Markdown / MDX

SEO
├── Sitemap
├── RSS
├── JSON-LD
├── OpenGraph
└── Canonical URL

Analytics
├── Cloudflare Analytics
└── Google Search Console
```

---

# 52. Recommended Development Order

Urutan implementasi:

```text
1. Project Setup
       ↓
2. Database Schema
       ↓
3. D1 Repository Layer
       ↓
4. Authentication
       ↓
5. Admin Layout
       ↓
6. Post CRUD
       ↓
7. Category & Tag
       ↓
8. Public Blog
       ↓
9. SEO
       ↓
10. Search
       ↓
11. Related Articles
       ↓
12. Series
       ↓
13. Projects
       ↓
14. Analytics
       ↓
15. Search Console
       ↓
16. Content Command Center
```

---

# 53. Final Product Concept

Project ini bukan sekadar:

```text
Personal Blog
```

Tetapi:

```text
                    PERSONAL KNOWLEDGE HUB
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
        BLOG               PROJECTS           PROFILE
          │                   │                   │
          ▼                   ▼                   ▼
      ARTICLES             PORTFOLIO           ABOUT
          │
          ▼
    CONTENT CLUSTERS
          │
          ▼
         SEO
          │
          ▼
      ORGANIC TRAFFIC
          │
          ▼
    PERSONAL BRANDING
```

Core value:

> **Write → Publish → Rank → Analyze → Improve → Build Authority**