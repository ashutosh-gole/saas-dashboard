import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

export interface MenuItem {
  name: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  menuItems = signal<MenuItem[]>([
    { name: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
    { name: 'Analytics', icon: 'bar-chart-2', route: '/analytics' },
    { name: 'Users', icon: 'users', route: '/users' },
    { name: 'Settings', icon: 'settings', route: '/settings' }
  ]);
}