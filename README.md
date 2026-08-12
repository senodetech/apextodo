# ApexTasks

ApexTasks is a full-stack task management web application designed for organizing, tracking, and prioritizing work items. The project is structured as a monorepo containing an Angular 19 frontend application and a NestJS RESTful backend API powered by PostgreSQL.

---

## Project Overview

ApexTasks provides a modern, responsive interface for managing daily tasks and project deliverables. The application supports dual viewing modes (List and Kanban Board), priority classification, category tagging, search filtering, and real-time dashboard task completion metrics.

### Frontend
- **Framework**: Angular 19 (Standalone Components)
- **State Management**: Reactive data flow using Angular Signals (`signal`, `computed`)
- **UI Architecture**: Glassmorphic theme built with custom CSS design tokens and responsive grid layouts
- **Views**: Interactive List View and Kanban Board View (To Do, High Priority/Urgent, Completed)

### Backend
- **Framework**: NestJS 11
- **Database ORM**: TypeORM
- **Database Engine**: PostgreSQL (with automated schema synchronization and fallback SQLite support)
- **Data Validation**: Request payload validation using `class-validator` and `class-transformer` DTOs
- **Security**: Global CORS configuration for API client integration

---

## System Requirements

- **Node.js**: `v18.x` or higher (`v22.x` recommended)
- **npm**: `v9.x` or higher
- **PostgreSQL**: `v14.x` or higher (running on port `5432`)

---

## Repository Structure

```text
apextodo/
├── backend/
│   ├── src/
│   │   ├── tasks/
│   │   │   ├── dto/
│   │   │   │   ├── create-task.dto.ts
│   │   │   │   └── update-task.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── task.entity.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.module.ts
│   │   │   └── tasks.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── kanban-board/
│   │   │   │   ├── task-form/
│   │   │   │   ├── task-list/
│   │   │   │   ├── task-stats/
│   │   │   │   └── task-toolbar/
│   │   │   ├── models/
│   │   │   │   └── task.model.ts
│   │   │   ├── services/
│   │   │   │   └── task.service.ts
│   │   │   └── app.component.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## Getting Started

### 1. Repository Setup

Clone the repository to your local environment:

```bash
git clone https://github.com/senodetech/apextodo.git
cd apextodo
```

---

### 2. Database Configuration

Ensure PostgreSQL is running locally, then create the application database:

```sql
CREATE DATABASE todo_db;
```

---

### 3. Backend API Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create or verify environment configuration in `backend/.env`:
   ```env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=todo_db
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run start:dev
   ```

The backend server will start at `http://localhost:3000` and expose REST API routes at `http://localhost:3000/api/tasks`.

---

### 4. Frontend Client Setup

1. In a separate terminal window, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```

The client application will be accessible in your browser at `http://localhost:4200`.

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DB_TYPE` | Database driver (`postgres` or `sqlite`) | `postgres` |
| `DB_HOST` | Database host address | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database user password | `postgres` |
| `DB_NAME` | Target database name | `todo_db` |
| `PORT` | API server HTTP port | `3000` |

---

## REST API Specification

### Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Retrieve all tasks. Supports filters: `completed`, `priority`, `category`, `search`. |
| `GET` | `/api/tasks/stats` | Retrieve aggregated dashboard metrics. |
| `GET` | `/api/tasks/:id` | Retrieve a single task by ID. |
| `POST` | `/api/tasks` | Create a new task item. |
| `PATCH` | `/api/tasks/:id` | Update an existing task item. |
| `DELETE` | `/api/tasks/:id` | Delete a task item by ID. |
| `DELETE` | `/api/tasks/completed/clear` | Clear all completed task items. |

### Request Sample (`POST /api/tasks`)

```json
{
  "title": "Implement User Authentication",
  "description": "Set up JWT authentication middleware and guards",
  "priority": "HIGH",
  "category": "Backend",
  "dueDate": "2026-08-20T17:00:00.000Z"
}
```

---

## Production Deployment

### Backend Service
To compile the NestJS backend for production:

```bash
cd backend
npm run build
```

Run the built JavaScript code using a process manager such as PM2:

```bash
pm2 start dist/src/main.js --name "apextodo-backend"
```

### Frontend Client
To build the Angular client for static hosting:

```bash
cd frontend
npm run build
```

The compiled assets will be placed in `frontend/dist/frontend/browser` and can be served via Nginx or any static hosting platform.

---

## License

This project is open-source software licensed under the MIT License.
