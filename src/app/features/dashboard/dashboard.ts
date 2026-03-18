import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  isPositive: boolean;
}

interface ActivityItem {
  user: string;
  action: string;
  target: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    NgxEchartsDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  // Metric cards data
  metricCards = signal<MetricCard[]>([
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1% from last month',
      icon: 'dollar-sign',
      isPositive: true
    },
    {
      title: 'Subscriptions',
      value: '+2350',
      change: '+180.1% from last month',
      icon: 'users',
      isPositive: true
    },
    {
      title: 'Sales',
      value: '+12,234',
      change: '+19% from last month',
      icon: 'credit-card',
      isPositive: true
    },
    {
      title: 'Active Now',
      value: '+573',
      change: '+201 since last hour',
      icon: 'activity',
      isPositive: true
    }
  ]);

  // Recent activity data
  recentActivity = signal<ActivityItem[]>([
    { user: 'Olivia Martin', action: 'purchased', target: 'Enterprise Plan', time: '2 minutes ago' },
    { user: 'Alex Johnson', action: 'upgraded to', target: 'Pro Plan', time: '15 minutes ago' },
    { user: 'Sarah Williams', action: 'cancelled', target: 'Basic Plan', time: '1 hour ago' },
    { user: 'Michael Chen', action: 'purchased', target: 'Business Plan', time: '2 hours ago' },
    { user: 'Emma Thompson', action: 'upgraded to', target: 'Enterprise Plan', time: '5 hours ago' }
  ]);

  // Chart options
  revenueChartOptions = signal<EChartsOption>({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: '#3b82f6'
        },
        lineStyle: {
          color: '#3b82f6'
        },
        itemStyle: {
          color: '#3b82f6'
        },
        data: [820, 932, 901, 934, 1290, 1330, 1320, 1200, 1100, 1300, 1450, 1500]
      }
    ]
  });

  activityChartOptions = signal<EChartsOption>({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '0%',
      left: 'center'
    },
    series: [
      {
        name: 'Activity',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 75, name: 'Desktop' },
          { value: 68, name: 'Mobile' },
          { value: 48, name: 'Tablet' }
        ]
      }
    ]
  });
}