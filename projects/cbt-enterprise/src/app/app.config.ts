// import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// import { JwtInterceptor } from './interceptors/jwt.interceptor';
// import { provideHighcharts } from 'highcharts-angular';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideBrowserGlobalErrorListeners(),
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideHttpClient(),
//     provideRouter(routes),
//     provideHighcharts(),
//     //Enable HttpClient and allow interceptors from dependency injection
//     provideHttpClient(withInterceptorsFromDi()),

//     // Register the JWT interceptor globally
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: JwtInterceptor,
//       multi: true
//     },

//   ]
// };



































import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
//import { provideHighcharts } from 'highcharts-angular';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';

// Import ECharts components for your dashboard
import { 
  BarChart, 
  LineChart, 
  PieChart 
} from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';

// Register all ECharts components
echarts.use([
  // Charts
  BarChart,
  LineChart, 
  PieChart,
  
  // Components
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  
  // Renderer
  CanvasRenderer
]);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    //provideHighcharts(),
    
    // ECharts configuration with registered components
    provideEchartsCore({ echarts }),
    
    // Enable HttpClient and allow interceptors from dependency injection
    provideHttpClient(withInterceptorsFromDi()),

    // Register the JWT interceptor globally
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
  ]
};
