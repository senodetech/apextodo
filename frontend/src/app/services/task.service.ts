import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Task,
  TaskFilter,
  TaskStats,
  CreateTaskInput,
  UpdateTaskInput,
  PaginatedTasksResponse,
} from '../models/task.model';
import { Observable, catchError, tap, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api/tasks';

  // Signals State
  tasks = signal<Task[]>([]);
  stats = signal<TaskStats | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Pagination Signals (20 tasks per page)
  page = signal<number>(1);
  limit = signal<number>(20);
  total = signal<number>(0);
  totalPages = signal<number>(1);

  // Mode & Scope Signals
  dashboardMode = signal<'admin' | 'personal'>('admin');
  memberScope = signal<'assigned' | 'delegated' | 'created' | 'all'>('assigned');

  filter = signal<TaskFilter>({
    completed: 'all',
    priority: 'all',
    category: 'all',
    search: '',
    assignedToId: '',
  });

  // Computed Values
  activeCount = computed(() => this.tasks().filter((t) => !t.completed).length);
  completedCount = computed(() => this.tasks().filter((t) => t.completed).length);

  categories = computed(() => {
    const set = new Set<string>([
      'General',
      'Work',
      'Personal',
      'Shopping',
      'Health',
      'Database',
      'Frontend',
      'Backend',
      'Docs',
    ]);
    this.tasks().forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  });

  constructor() {
    // If not admin, initialize in personal mode
    if (!this.authService.isAdmin()) {
      this.dashboardMode.set('personal');
    }
  }

  loadTasks() {
    if (!this.authService.accessToken()) return;

    this.loading.set(true);
    this.error.set(null);

    const mode = this.authService.isAdmin() ? this.dashboardMode() : 'personal';

    let params = new HttpParams()
      .set('page', this.page().toString())
      .set('limit', this.limit().toString())
      .set('mode', mode)
      .set('scope', this.memberScope());

    const currentFilter = this.filter();

    if (currentFilter.completed !== 'all') {
      params = params.set(
        'completed',
        currentFilter.completed === 'completed' ? 'true' : 'false',
      );
    }
    if (currentFilter.priority && currentFilter.priority !== 'all') {
      params = params.set('priority', currentFilter.priority);
    }
    if (currentFilter.category && currentFilter.category !== 'all') {
      params = params.set('category', currentFilter.category);
    }
    if (currentFilter.search.trim()) {
      params = params.set('search', currentFilter.search.trim());
    }
    if (currentFilter.assignedToId) {
      params = params.set('assignedToId', currentFilter.assignedToId);
    }

    this.http.get<PaginatedTasksResponse>(this.apiUrl, { params }).subscribe({
      next: (res) => {
        this.tasks.set(res.data || []);
        this.total.set(res.total || 0);
        this.page.set(res.page || 1);
        this.limit.set(res.limit || 20);
        this.totalPages.set(res.totalPages || 1);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.clearSession();
          return;
        }
        console.error('Failed to fetch tasks', err);
        this.error.set('Could not connect to NestJS backend. Ensure backend is running.');
        this.loading.set(false);
      },
    });
  }

  loadStats() {
    if (!this.authService.accessToken()) return;

    const mode = this.authService.isAdmin() ? this.dashboardMode() : 'personal';
    const params = new HttpParams().set('mode', mode);

    this.http.get<TaskStats>(`${this.apiUrl}/stats`, { params }).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Failed to fetch stats', err),
    });
  }

  setDashboardMode(mode: 'admin' | 'personal') {
    this.dashboardMode.set(mode);
    this.page.set(1);
    this.loadTasks();
    this.loadStats();
  }

  setMemberScope(scope: 'assigned' | 'delegated' | 'created' | 'all') {
    this.memberScope.set(scope);
    this.page.set(1);
    this.loadTasks();
  }

  setPage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page.set(newPage);
      this.loadTasks();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.setPage(this.page() + 1);
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.setPage(this.page() - 1);
    }
  }

  setFilter(newFilter: Partial<TaskFilter>) {
    this.filter.update((prev) => ({ ...prev, ...newFilter }));
    this.page.set(1);
    this.loadTasks();
  }

  createTask(input: CreateTaskInput) {
    this.loading.set(true);
    return this.http.post<Task>(this.apiUrl, input).pipe(
      tap((newTask) => {
        this.loadTasks();
        this.loadStats();
        this.loading.set(false);
      }),
      catchError((err) => {
        this.error.set('Failed to create task');
        this.loading.set(false);
        throw err;
      }),
    );
  }

  updateTask(id: string, updates: UpdateTaskInput) {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, updates).pipe(
      tap((updated) => {
        this.tasks.update((prev) =>
          prev.map((t) => (t.id === id ? updated : t)),
        );
        this.loadStats();
      }),
      catchError((err) => {
        this.loadTasks();
        throw err;
      }),
    );
  }

  toggleComplete(task: Task) {
    return this.updateTask(task.id, { completed: !task.completed }).subscribe();
  }

  deleteTask(id: string) {
    const previousTasks = this.tasks();
    this.tasks.update((prev) => prev.filter((t) => t.id !== id));

    return this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.loadTasks();
          this.loadStats();
        }),
        catchError((err) => {
          this.tasks.set(previousTasks);
          throw err;
        }),
      )
      .subscribe();
  }

  clearCompleted() {
    return this.http
      .delete<{ count: number }>(`${this.apiUrl}/completed/clear`)
      .pipe(
        tap(() => {
          this.loadTasks();
          this.loadStats();
        }),
      )
      .subscribe();
  }
}
