import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Task, TaskFilter, TaskStats, CreateTaskInput, UpdateTaskInput } from '../models/task.model';
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

  filter = signal<TaskFilter>({
    completed: 'all',
    priority: 'all',
    category: 'all',
    search: '',
  });

  // Computed Values
  activeCount = computed(() => this.tasks().filter((t) => !t.completed).length);
  completedCount = computed(() => this.tasks().filter((t) => t.completed).length);

  categories = computed(() => {
    const set = new Set<string>(['General', 'Work', 'Personal', 'Shopping', 'Health', 'Database', 'Frontend', 'Backend', 'Docs']);
    this.tasks().forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  });

  constructor() {
    if (this.authService.accessToken()) {
      this.loadTasks();
      this.loadStats();
    }
  }

  loadTasks() {
    if (!this.authService.accessToken()) return;

    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    const currentFilter = this.filter();

    if (currentFilter.completed !== 'all') {
      params = params.set('completed', currentFilter.completed === 'completed' ? 'true' : 'false');
    }
    if (currentFilter.priority !== 'all') {
      params = params.set('priority', currentFilter.priority);
    }
    if (currentFilter.category !== 'all') {
      params = params.set('category', currentFilter.category);
    }
    if (currentFilter.search.trim()) {
      params = params.set('search', currentFilter.search.trim());
    }

    this.http.get<Task[]>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        this.tasks.set(data);
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

    this.http.get<TaskStats>(`${this.apiUrl}/stats`).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Failed to fetch stats', err),
    });
  }

  setFilter(newFilter: Partial<TaskFilter>) {
    this.filter.update((prev) => ({ ...prev, ...newFilter }));
    this.loadTasks();
  }

  createTask(input: CreateTaskInput) {
    this.loading.set(true);
    return this.http.post<Task>(this.apiUrl, input).pipe(
      tap((newTask) => {
        this.tasks.update((prev) => [newTask, ...prev]);
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
    // Optimistic UI update
    this.tasks.update((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );

    return this.http.patch<Task>(`${this.apiUrl}/${id}`, updates).pipe(
      tap((updated) => {
        this.tasks.update((prev) =>
          prev.map((t) => (t.id === id ? updated : t)),
        );
        this.loadStats();
      }),
      catchError((err) => {
        this.loadTasks(); // revert on error
        throw err;
      }),
    );
  }

  toggleComplete(task: Task) {
    return this.updateTask(task.id, { completed: !task.completed }).subscribe();
  }

  deleteTask(id: string) {
    // Optimistic removal
    const previousTasks = this.tasks();
    this.tasks.update((prev) => prev.filter((t) => t.id !== id));

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadStats()),
      catchError((err) => {
        this.tasks.set(previousTasks); // revert
        throw err;
      }),
    ).subscribe();
  }

  clearCompleted() {
    this.tasks.update((prev) => prev.filter((t) => !t.completed));

    return this.http.delete<{ count: number }>(`${this.apiUrl}/completed/clear`).pipe(
      tap(() => this.loadStats()),
    ).subscribe();
  }
}
