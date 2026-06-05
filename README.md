# Stoik URL Shortener

A functional URL Shortener built inside a Bun Monorepo. 

---

## Architecture & Design Decisions

### Monorepo Structure
We use Bun Workspaces to partition application layers cleanly:
- `apps/web`: React SPA compiled with Vite. Configured to import layout components directly from the local `@stoik/design-system` package.
- `apps/backend`: NestJS backend server running on the Bun runtime. Maps REST requests to Bounded Context Use Cases.
- `libs/database`: A single database package housing the Prisma Schema, migrations, and the instantiated `PrismaClient`.
- `libs/design-system`: A presentation-only library utilizing React and CSS Modules. Styled with Custom CSS Variables targeting a premium **Glassmorphism Dark Mode**.
- `libs/url_shortener`: Core Bounded Context library containing domain logic and use cases:
  - **Domain**: Domain entities (`ShortenedUrl`), Value Objects (`LongUrl`, `ShortSlug`), repository interfaces (`UrlRepository`), and Domain exceptions.
  - **Application**: Executable Use Cases (`ShortenUrlUseCase`, `RedirectUrlUseCase`, `GetAnalyticsUseCase`).
  - **Infrastructure**: Database repository adapter (`PrismaUrlRepository`) and the cryptographically secure slug generator (`CryptoSlugGenerator`).

### Core Logic
The business rules are encapsulated in self-contained:
- **LongUrl**: Automatically formats missing protocols (e.g. `google.com` to `https://google.com`), parses syntax, and runs loopback / private IP filtering to prevent Server-Side Request Forgery (SSRF).
- **ShortSlug**: Restricts slug codes to alphanumeric characters (Base62) between 4 and 10 characters in length.
- **ShortenedUrl**: Restricts click logging and metadata updates.
- Use Cases inject repositories via abstractions, keeping business workflows completely independent of NestJS and Prisma frameworks.

### Click Logging & Analytics
Redirections record access analytics. In `UrlVisit` table:
- Visitor IP address.
- Visitor User-Agent string.
- Visitor Referrer header.
- Timestamp of access.

---

## Getting Started

### Prerequisites
- **Bun** (v1.x or higher)
- **Docker** and **Docker Compose** (for PostgreSQL)

### Setup & Installation

1. **Clone the repository and install dependencies**:
   ```bash
   bun install
   ```

2. **Spin up local PostgreSQL**:
   ```bash
   bun run db:up
   ```

3. **Run database migrations**:
   ```bash
   bun run db:migrate
   ```

4. **Start the development servers**:
   ```bash
   bun run dev
   ```
   - Frontend runs on: `http://localhost:5173/` (Vite)
   - Backend runs on: `http://localhost:3000/` (NestJS)

5. **Run the test suites**:
   ```bash
   bun test
   ```

---

## Security Mitigations (SSRF Protection)
To prevent malicious requests targeting internal infrastructure (like AWS instance metadata endpoints, internal routers, or database ports), the `LongUrl` value object actively rejects the following:
- Loopback addresses (`localhost`, `127.0.0.1`, `0.0.0.0`, `[::1]`).
- Private IPv4 ranges (Class A `10.*.*.*`, Class B `172.16.*.*` to `172.31.*.*`, Class C `192.168.*.*`, Link-local `169.254.*.*`).
- Private / Unique Local IPv6 ranges (`fc00::/7` and `fe80::/10`).
- Non-HTTP/HTTPS protocol headers (e.g. `ftp://`, `file://`).
