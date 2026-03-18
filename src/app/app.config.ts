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
  ShoppingCart, Eye, ArrowUpRight, ArrowDownRight,
  CreditCard, Users2, MousePointer2
} from 'lucide-angular';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { routes } from './app.routes';

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);

export const appConfig: ApplicationConfig = {
  providers: [
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
        ShoppingCart, Eye, ArrowUpRight, ArrowDownRight,
        CreditCard, Users2, MousePointer2
      })
    )
  ]
};
