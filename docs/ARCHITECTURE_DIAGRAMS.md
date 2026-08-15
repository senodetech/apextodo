# 🏛️ ApexTodo - Architecture & System Flow Blueprints

This document contains the complete high-resolution architectural diagrams and flowcharts for the **ApexTodo** enterprise platform.

> [!TIP]
> **Interactive & Downloadable HTML Viewer**:
> Open [docs/architecture-diagrams.html](file:///F:/workspace/portfolio/apextodo/docs/architecture-diagrams.html) directly in any web browser to view the diagrams in ultra-crisp vector format with **1-Click "Download Vector SVG"** buttons for every diagram!

---

## 🌐 1. Full-Stack System Architecture Blueprint

```mermaid
flowchart TB
    subgraph BROWSER_LAYER ["Client Browser (Angular 19 SPA)"]
        direction TB
        BOOT["index.html ➔ main.ts ➔ appConfig"]
        ROUTER["Angular Router & Functional Guards (authGuard, adminGuard)"]
        
        subgraph SMART_CONTAINER ["Smart Container Layer"]
            DASH["DashboardComponent (Orchestrator)"]
            HEADER["HeaderComponent (Role Switcher & Notification Bell)"]
        end
        
        subgraph PRESENTATIONAL_LAYER ["Presentational Views & Modals"]
            ADMIN_DASH["AdminDashboardComponent (10 Widgets + Master Table)"]
            MEMBER_DASH["MemberDashboardComponent (Scoped Tabs: Assigned/Created)"]
            TASK_LIST["TaskListComponent (List View)"]
            KANBAN["KanbanBoardComponent (Kanban View)"]
            TASK_MODAL["TaskFormComponent (Create / Reassign)"]
            USER_MODAL["UserManagementModalComponent (Admin RBAC)"]
            ALERT_MODAL["NotificationsModalComponent (Super Admin Alert Center)"]
        end

        subgraph SIGNALS_STATE ["Reactive Signals State Layer"]
            AUTH_STATE["AuthService (currentUser, tokens, role)"]
            TASK_STATE["TaskService (tasks, stats, memberScope, pagination)"]
            NOTIF_STATE["NotificationService (notifications, unreadCount)"]
            ADMIN_STATE["UserAdminService (users, assignableUsers)"]
        end

        INTERCEPTOR["authInterceptor (Bearer Token Injection & 401 Auto-Refresh Loop)"]
    end

    subgraph BACKEND_LAYER ["NestJS Enterprise Gateway (Node.js API)"]
        direction TB
        GATEWAY["main.ts (CORS, Global ValidationPipe, Port 3000)"]
        
        subgraph GUARDS_PIPE ["Security & Interception Layer"]
            JWT_GUARD["JwtAuthGuard (Passport JWT Strategy)"]
            ROLE_GUARD["RolesGuard (@Roles: SUPER_ADMIN, ADMIN)"]
        end

        subgraph MODULES ["Domain Micro-Modules"]
            AUTH_MOD["AuthModule (Login, Register, Refresh, Me)"]
            USERS_MOD["UsersModule (Provision, Delete, Assignable)"]
            TASKS_MOD["TasksModule (CRUD, Scoping, Pagination, Stats)"]
            NOTIF_MOD["NotificationsModule (Alert Dispatcher & Unread)"]
        end

        subgraph DATA_LAYER ["TypeORM Repository Layer"]
            TASK_REPO["TaskRepository (QueryBuilder)"]
            USER_REPO["UserRepository"]
            LOG_REPO["AuthLogRepository"]
            NOTIF_REPO["NotificationRepository"]
        end
    end

    subgraph DB_LAYER ["PostgreSQL Database (todo_db)"]
        T_USERS[("users table")]
        T_TASKS[("tasks table")]
        T_LOGS[("auth_logs table")]
        T_NOTIFS[("notifications table")]
    end

    %% UI Connections
    BOOT --> ROUTER
    ROUTER --> DASH
    DASH --> HEADER
    DASH --> ADMIN_DASH
    DASH --> MEMBER_DASH
    MEMBER_DASH --> TASK_LIST
    MEMBER_DASH --> KANBAN
    DASH --> TASK_MODAL
    DASH --> USER_MODAL
    DASH --> ALERT_MODAL

    ADMIN_DASH -.-> TASK_STATE
    MEMBER_DASH -.-> TASK_STATE
    HEADER -.-> AUTH_STATE
    HEADER -.-> NOTIF_STATE
    TASK_STATE -.-> INTERCEPTOR
    AUTH_STATE -.-> INTERCEPTOR
    NOTIF_STATE -.-> INTERCEPTOR
    ADMIN_STATE -.-> INTERCEPTOR

    %% Network Connection
    INTERCEPTOR ==>|REST API over HTTPS| GATEWAY

    %% Backend Connections
    GATEWAY --> JWT_GUARD --> ROLE_GUARD
    ROLE_GUARD --> MODULES
    MODULES --> DATA_LAYER
    DATA_LAYER --> DB_LAYER
```

---

## 🚀 2. Frontend Bootstrapping & Route Resolution Flow

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Client Browser
    participant Index as index.html
    participant Main as main.ts
    participant Config as appConfig (app.config.ts)
    participant App as AppComponent
    participant Router as Angular Router & authGuard
    participant AuthSvc as AuthService
    participant Dash as DashboardComponent

    Browser->>Index: Requests http://localhost:4200
    Index->>Index: Parses <app-root></app-root> and loads bundle
    Index->>Main: Executes bootstrapApplication(AppComponent, appConfig)
    Main->>Config: Registers Providers (Router, Zone Event Coalescing, provideHttpClient + authInterceptor)
    Config->>App: Instantiates root AppComponent with <router-outlet>
    App->>Router: Navigates to default route "/"
    Router->>AuthSvc: Reads tokens from localStorage (accessToken, refreshToken)
    alt No Active Token
        Router->>Browser: Redirects to /login (LoginComponent)
    else Token Exists
        Router->>Router: authGuard passes (returns true)
        Router->>Dash: Loads DashboardComponent into <router-outlet>
    end
```

---

## 🖥️ 3. Dashboard Component & Scoping Hierarchy

```mermaid
flowchart TD
    DASH[DashboardComponent: Smart Orchestrator] --> INIT{Check User Role & Mode}
    
    INIT -->|isAdmin && mode == 'admin'| AD[AdminDashboardComponent: Executive 10-Widget Command Center]
    INIT -->|mode == 'personal' or Member| MD[MemberDashboardComponent: Scoped Operator Portal]
    
    AD --> TABLE[Master Organization Table: Creator & Assignee Tracking]
    AD --> WIDGETS[10 Executive Metrics Grid]
    
    MD --> TABS{Active Scope Tab}
    TABS -->|scope == 'assigned'| T1[📥 Tasks Assigned to Me]
    TABS -->|scope == 'delegated'| T2[📤 Tasks I Assigned to Others]
    TABS -->|scope == 'created'| T3[✍️ My Personal Created Tasks]
    TABS -->|scope == 'all'| T4[📋 All Workspace Tasks]

    MD --> VIEWS{Current View}
    VIEWS -->|List View| TL[TaskListComponent]
    VIEWS -->|Kanban View| KB[KanbanBoardComponent]
```

---

## 🔄 4. End-to-End Request & Auto-Refresh Flow

```mermaid
sequenceDiagram
    autonumber
    participant UI as Angular Component
    participant Svc as TaskService
    participant Interceptor as authInterceptor
    participant AuthSvc as AuthService
    participant API as NestJS TasksController
    participant Guard as JwtAuthGuard & RolesGuard
    participant TaskSvc as TasksService (Backend)
    participant DB as PostgreSQL Database

    UI->>Svc: User triggers loadTasks()
    Svc->>Interceptor: HTTP GET /api/tasks?mode=admin&page=1&limit=20
    Interceptor->>Interceptor: Appends Authorization: Bearer <accessToken>
    Interceptor->>API: Dispatches Request to NestJS
    API->>Guard: Checks JWT token validity
    
    alt Token Valid
        Guard->>TaskSvc: findAll(filter, user)
        TaskSvc->>DB: TypeORM QueryBuilder with joins on user & assignedTo
        DB-->>TaskSvc: Returns { data: Task[], total: 24, page: 1, limit: 20 }
        TaskSvc-->>API: Paginated Tasks Response
        API-->>Interceptor: HTTP 200 OK + JSON
        Interceptor-->>Svc: Emits data Observable
        Svc->>Svc: Updates tasks.set(response.data) & total.set(response.total)
        Svc-->>UI: Angular Signals automatically re-render DOM
    else Token Expired (401 Unauthorized)
        API-->>Interceptor: HTTP 401 Unauthorized
        Interceptor->>AuthSvc: Triggers refreshSession()
        AuthSvc->>API: POST /api/auth/refresh { refreshToken }
        API->>DB: Validates & rotates refresh token in auth_logs
        DB-->>API: Fresh tokens generated
        API-->>AuthSvc: Returns { accessToken: "new_jwt", refreshToken: "new_ref" }
        AuthSvc->>AuthSvc: Updates accessToken signal & localStorage
        Interceptor->>API: Automatically retries original request with new token
        API-->>Interceptor: HTTP 200 OK
        Interceptor-->>Svc: Delivers data seamlessly (Zero UI interruption)
    end
```

---

## 🛡️ 5. Backend Security & Interception Pipeline

```mermaid
flowchart LR
    REQ[HTTP Request] --> M1[CORS Middleware]
    M1 --> M2[ValidationPipe: DTO Sanitization]
    M2 --> G1[JwtAuthGuard: Token & User Hydration]
    G1 --> G2[RolesGuard: RBAC Authorization]
    G2 --> CTRL[Controller Endpoint]
    CTRL --> SVC[Service Business Logic]
    SVC --> NOTIF{Is Admin Action?}
    NOTIF -->|Yes| ALERT[NotificationsService: Create Super Admin Alert]
    SVC --> REPO[TypeORM Repository QueryBuilder]
    REPO --> PG[(PostgreSQL Database)]
```
