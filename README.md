# Board Exam Management System

Full-stack board exam analytics and data management system with:

- **Frontend:** Next.js (App Router), React, TanStack Table/Query
- **Backend:** ASP.NET Core 8 Web API
- **Database:** MySQL (XAMPP-compatible)
- **Auth:** JWT (HttpOnly cookie)

## Monorepo Structure

```text
board_exam/
├── frontend/   # Next.js client app
└── backend/    # ASP.NET Core API + EF Core (MySQL)
```

## Core Features

- Authentication (login/logout/profile)
- Role-based access control (admin-focused management)
- Data management modules:
  - Users
  - Departments
  - Programs
  - Regions
  - Schools
  - Role statuses
  - National passing rates
  - Statistics data
- Compare data module
- Export/import support for statistics data
- Soft deletes in backend entities
- Lookup table-driven values (status/gender/roles)

## Requirements

- Node.js 18+
- pnpm
- .NET 8 SDK
- MySQL (XAMPP or standalone)

## 1) Backend Setup (`backend`)

### Configure database

Update `backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Default": "server=127.0.0.1;port=3306;database=board_exam;user=root;password="
  }
}
```

> If your XAMPP MySQL runs on `3307`, change `port=3307`.

### Run API

```bash
cd backend
dotnet restore
dotnet run
```

API base:

- `http://127.0.0.1:5000/api/v1` (based on launch settings)

Swagger (Development):

- `http://127.0.0.1:5000/swagger`

### Seeding

The backend includes a startup seeder and DB self-healing retries.
Default seed users include:

- `admin / admin123`
- `editor / editor123`
- `viewer / viewer123`

## 2) Frontend Setup (`frontend`)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API=http://127.0.0.1:5000/api/v1
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

Then run:

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend app:

- `http://localhost:3000`

## Authentication Notes

- Login issues JWT cookie (`jwt`) from backend.
- Frontend sends credentials with API requests.
- In development, Turnstile can be bypassed if site key is not set.

## Backend API Prefix

All backend routes use:

- `api/v1/...`

Examples:

- `api/v1/auth/login`
- `api/v1/auth/profile`
- `api/v1/users`
- `api/v1/statistics-data`
- `api/v1/lookups`

## Development Commands

### Backend

```bash
cd backend
dotnet build
dotnet watch run
```

### Frontend

```bash
cd frontend
pnpm lint
pnpm dev
```

## Troubleshooting

- **401 on protected endpoints:** Login first and ensure cookie-based requests are enabled.
- **DB connection error:** Verify MySQL host/port in `appsettings.json`.
- **Port conflicts:** Update backend launch settings or run with `--urls`.

## Notes

- Refresh tokens are **not** implemented yet (JWT session only).
- Role and status values are DB-managed via lookup tables.
