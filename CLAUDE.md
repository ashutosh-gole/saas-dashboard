# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.
All rules below are verified against Angular 21 official docs (angular.dev).

---

## Project Overview

Angular 21 SaaS dashboard application.

- **Framework**: Angular 21 — standalone, zoneless by default, signals-first
- **UI**: Angular Material v21 (Azure/Blue theme)
- **Styling**: Tailwind CSS v4 (configured via `--style=tailwind`)
- **Icons**: lucide-angular (tree-shakeable, 1500+ icons)
- **Charts**: ngx-echarts + Apache ECharts
- **Testing**: Vitest (stable default in Angular 21)
- **Dates**: dayjs
- **Figma source**: https://www.figma.com/proto/MyQWkpmYwpIu4bWWd7Hcoq/SAAS-Dashboard--Community-

---

## Development Commands

```bash
ng serve                              # dev server → http://localhost:4200
ng build                              # production build → dist/
ng build --configuration development  # dev build with source maps
ng test                               # Vitest unit tests
ng generate component path/name       # scaffold component
```

---

## Project Structure

```
src/
  app/
    core/
      services/          # singleton services — providedIn: 'root'
      guards/            # route guards
      interceptors/      # HTTP interceptors
    shared/
      components/        # reusable presentational components
      pipes/             # custom pipes
      directives/        # custom attribute directives
    features/
      dashboard/         # dashboard.ts + dashboard.html + dashboard.scss
      analytics/         # analytics.ts + analytics.html + analytics.scss
      users/             # users.ts + users.html + users.scss
      settings/          # settings.ts + settings.html + settings.scss
    layout/
      shell/             # shell.ts — root wrapper (sidebar + topbar + router-outlet)
      sidebar/           # sidebar.ts — navigation links
      topbar/            # topbar.ts — search, notifications, user menu
    app.ts               # root component (Angular 21 naming: app.ts not app.component.ts)
    app.html
    app.scss
    app.routes.ts
    app.config.ts
  styles.css             # Tailwind directives + global resets
  material-theme.scss    # Angular Material custom theme (Azure/Blue)
```

---

## app.config.ts — canonical setup

```ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideEchartsCore } from 'ngx-echarts';
import { LucideAngularModule } from 'lucide-angular';
import {
  LayoutDashboard, Users, Settings, Bell, Search,
  TrendingUp, TrendingDown, DollarSign, BarChart2,
  Activity, LogOut, Moon, Sun, Menu, X,
  Download, Filter, RefreshCw, ChevronRight,
  ShoppingCart, Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-angular';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { routes } from './app.routes';

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);

export const appConfig: ApplicationConfig = {
  providers: [
    // NOTE: provideZonelessChangeDetection() is NOT needed — zoneless is automatic in Angular 21
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideEchartsCore({ echarts }),
    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard, Users, Settings, Bell, Search,
        TrendingUp, TrendingDown, DollarSign, BarChart2,
        Activity, LogOut, Moon, Sun, Menu, X,
        Download, Filter, RefreshCw, ChevronRight,
        ShoppingCart, Eye, ArrowUpRight, ArrowDownRight
      })
    ),
  ],
};
```

---

## Angular 21 Rules — ENFORCED

### 1. Zoneless — automatic, nothing to configure

```ts
// ✅ CORRECT — no zone provider needed in Angular 21
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), ...]
};

// ❌ WRONG — do not add this, it is already the default
providers: [provideZonelessChangeDetection()]

// ❌ NEVER — do not import or reference zone.js
import 'zone.js';
```

Change detection triggers only via:
- Signal value changes in the template
- `(click)` and other DOM events bound in template
- `async` pipe
- `markForCheck()` / `ComponentRef.setInput()`

### 2. Dependency injection — always inject()

```ts
// ✅ CORRECT
export class DashboardComponent {
  private router   = inject(Router);
  private http     = inject(HttpClient);
  private service  = inject(DashboardService);
}

// ❌ WRONG — never constructor params
constructor(private router: Router, private http: HttpClient) {}
```

### 3. Components — always standalone + OnPush

```ts
// ✅ CORRECT — every component follows this pattern
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, LucideAngularModule, NgxEchartsDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {}
```

### 4. File naming — 2025 style guide

| Old (do not use)          | New (Angular 21)       |
|---------------------------|------------------------|
| `app.component.ts`        | `app.ts`               |
| `dashboard.component.ts`  | `dashboard.ts`         |
| `dashboard.component.html`| `dashboard.html`       |
| `auth.service.ts`         | `auth.service.ts` ✅   |
| `auth.guard.ts`           | `auth.guard.ts` ✅     |

Services, guards, pipes and interceptors keep the `.service.ts` / `.guard.ts` suffix.
Only components drop the `.component.` segment.

### 5. State — signals only, never component-level Observables

```ts
// ✅ CORRECT
export class DashboardComponent {
  metrics    = signal<Metric[]>([]);
  isLoading  = signal(true);
  total      = computed(() => this.metrics().reduce((s, m) => s + m.value, 0));

  constructor() {
    effect(() => console.log('metrics changed:', this.metrics().length));
  }
}

// ❌ WRONG — no Subject / BehaviorSubject for component state
isLoading$ = new BehaviorSubject(true);
```

Use Observables only inside services for HTTP. Convert to signals in components with `toSignal()`:

```ts
private dashboardService = inject(DashboardService);
metrics = toSignal(this.dashboardService.getMetrics(), { initialValue: [] });
```

### 6. Templates — new control flow only

```html
<!-- ✅ CORRECT -->
@if (isLoading()) {
  <mat-spinner />
} @else if (metrics().length === 0) {
  <p>No data</p>
} @else {
  <div>{{ metrics().length }} metrics</div>
}

@for (item of metrics(); track item.id) {
  <app-metric-card [metric]="item" />
}

@switch (status()) {
  @case ('active')   { <span class="text-green-600">Active</span> }
  @case ('inactive') { <span class="text-red-600">Inactive</span> }
  @default           { <span class="text-gray-400">Unknown</span> }
}

<!-- ❌ NEVER use these directives -->
<div *ngIf="isLoading">...</div>
<div *ngFor="let item of items">...</div>
```

### 7. Routing — lazy load every route

```ts
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics').then(m => m.AnalyticsComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users').then(m => m.UsersComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then(m => m.SettingsComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
```

---

## Forms

### Signal Forms (experimental — Angular 21)

Use for new forms in this project. API is stable enough for a dashboard.
Import from `@angular/forms/signals`. Do NOT mix imports with `@angular/forms` unless using `compatForm()`.

```ts
import { Component, signal } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],   // ← import FormField directive
  template: `
    <form (submit)="onSubmit($event)">

      <input type="email" [formField]="loginForm.email" />
      @if (loginForm.email().touched() && loginForm.email().invalid()) {
        @for (err of loginForm.email().errors(); track err) {
          <p class="text-red-500 text-xs">{{ err.message }}</p>
        }
      }

      <input type="password" [formField]="loginForm.password" />

      <button type="submit" [disabled]="loginForm().invalid()">
        Sign in
      </button>

    </form>
  `,
})
export class LoginComponent {
  loginModel = signal<LoginData>({ email: '', password: '' });

  loginForm = form(this.loginModel, (path) => {
    required(path.email,    { message: 'Email is required' });
    email(path.email,       { message: 'Enter a valid email' });
    required(path.password, { message: 'Password is required' });
    minLength(path.password, 8, { message: 'Min 8 characters' });
  });

  async onSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (this.loginForm().invalid()) return;
    const data = this.loginModel(); // plain typed object — send to API
    await inject(AuthService).login(data);
  }
}
```

**Field state API:**

```ts
loginForm.email           // FieldTree<string> — the field node
loginForm.email()         // FieldState — call as function to get state
loginForm.email().value() // current string value
loginForm.email().valid()    // boolean
loginForm.email().invalid()  // boolean
loginForm.email().touched()  // boolean
loginForm.email().dirty()    // boolean
loginForm.email().errors()   // { message: string }[]
loginForm.email().disabled() // boolean

// Programmatic updates:
loginForm.email().value.set('new@email.com');
loginForm.email().value.update(v => v.trim());

// Full form state:
loginForm()           // FormState
loginForm().valid()   // boolean — entire form
loginForm().invalid() // boolean
```

### Reactive Forms — use only for complex/legacy scenarios

```ts
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class SettingsComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name:  ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });
}
```

---

## Icons — lucide-angular

Always import `LucideAngularModule` in the component's `imports` array.
Use **kebab-case** for icon names in templates.

```ts
// In component:
imports: [LucideAngularModule]

// In template:
<lucide-icon name="layout-dashboard" [size]="20" />
<lucide-icon name="trending-up"      [size]="20" class="text-blue-500" />
<lucide-icon name="bell"             [size]="18" class="text-gray-400" />
<lucide-icon name="bar-chart-2"      [size]="20" />
<lucide-icon name="arrow-up-right"   [size]="16" class="text-green-500" />
```

| PascalCase (import)  | kebab-case (template)  |
|----------------------|------------------------|
| LayoutDashboard      | layout-dashboard       |
| TrendingUp           | trending-up            |
| BarChart2            | bar-chart-2            |
| ArrowUpRight         | arrow-up-right         |
| ShoppingCart         | shopping-cart          |
| DollarSign           | dollar-sign            |

---

## Charts — ngx-echarts

```ts
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

@Component({
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `
    <div echarts [options]="chartOptions()" class="h-64 w-full"></div>
  `
})
export class RevenueChartComponent {
  chartOptions = signal<EChartsOption>({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: { type: 'value' },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true,
      areaStyle: {},
    }],
  });
}
```

---

## HTTP — services pattern

```ts
// core/services/dashboard.service.ts
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getMetrics() {
    return this.http.get<Metric[]>('/api/metrics');
  }
}

// In component — convert Observable to signal:
import { toSignal } from '@angular/core/rxjs-interop';

@Component({ standalone: true, changeDetection: ChangeDetectionStrategy.OnPush })
export class DashboardComponent {
  private service = inject(DashboardService);

  metrics = toSignal(this.service.getMetrics(), { initialValue: [] });
}
```

---

## Styling rules

- **Layout & spacing**: Tailwind CSS utility classes
- **Components**: Angular Material (`mat-card`, `mat-table`, `mat-button`, etc.)
- **Never** use `ngClass` — use native class bindings:

```html
<!-- ✅ CORRECT -->
<div [class.active]="isActive()" [class.disabled]="isDisabled()">

<!-- ❌ WRONG — ngClass is soft-deprecated in Angular 21 -->
<div [ngClass]="{'active': isActive()}">
```

- Dark mode: toggled via `.dark-theme` class on `<body>` using Angular Material theming
- Font: Inter (loaded via Google Fonts in `index.html`)
- Responsive: mobile-first using Tailwind breakpoints (`sm:`, `md:`, `lg:`)

---

## Testing — Vitest (stable default in Angular 21)

```ts
// dashboard.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.whenStable();                // use whenStable() not detectChanges()
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

---

## Angular MCP Server tools (available in Claude Code)

```
find_examples          — stable: find Angular code examples
search_documentation   — stable: search angular.dev docs for this project's Angular version
get_best_practices     — stable: get Angular coding best practices
ai_tutor               — stable: interactive Angular learning assistant
modernize              — experimental: run migrations (control-flow, signals, etc.)
onpush_zoneless_migration — experimental: plan OnPush + zoneless migration
```

---

## Figma Source

**URL**: https://www.figma.com/proto/MyQWkpmYwpIu4bWWd7Hcoq/SAAS-Dashboard--Community-

When generating components from this Figma file:
1. Extract exact hex color values — map to Tailwind `theme.extend.colors` in `tailwind.config.js`
2. Match spacing/padding values to Tailwind scale (`p-4` = 16px, `p-6` = 24px, etc.)
3. Match Figma icon names to Lucide equivalents
4. Use Angular Material components where they match (tables, forms, dialogs, menus)
5. Apply Tailwind only for layout, spacing, and color — not for components Material already provides
6. Match card border-radius, shadow, and typography scale exactly

---

## STRICT DO NOT LIST

| ❌ Never do this                            | ✅ Do this instead                          |
|---------------------------------------------|---------------------------------------------|
| `import 'zone.js'`                          | Nothing — zoneless is automatic             |
| `provideZonelessChangeDetection()`          | Nothing — it's the default                 |
| `constructor(private s: Service)`           | `private s = inject(Service)`              |
| `*ngIf`, `*ngFor`, `*ngSwitch`             | `@if`, `@for`, `@switch`                   |
| `NgModule` / `@NgModule`                    | Standalone components only                  |
| `[ngClass]="{'a': cond}"`                  | `[class.a]="cond"`                         |
| `new FormGroup()` / `new FormControl()`    | `form()` from `@angular/forms/signals`      |
| `Validators.required` in Signal Forms      | `required(path.field)` from `@angular/forms/signals` |
| `[formField]` from `@angular/forms`        | `[formField]` from `@angular/forms/signals` (FormField directive) |
| `BehaviorSubject` for component state      | `signal()` + `computed()`                  |
| `import moment from 'moment'`              | `import dayjs from 'dayjs'`                |
| `ChangeDetectionStrategy.Default`          | `ChangeDetectionStrategy.OnPush`           |
| `import * as echarts from 'echarts'`       | Import only needed chart types (tree-shake)|
| `fixture.detectChanges()`  in tests        | `await fixture.whenStable()`               |
| `dashboard.component.ts` naming            | `dashboard.ts` (2025 naming)               |
