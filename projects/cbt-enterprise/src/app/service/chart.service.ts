// chart.service.ts
import { Injectable } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  
  constructor() {
    Chart.register(...registerables);
  }

  createChart(ctx: CanvasRenderingContext2D, config: ChartConfiguration): Chart {
    return new Chart(ctx, config);
  }

  // Predefined chart configurations
  getBarChartConfig(data: any, title: string): ChartConfiguration {
    return {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: title
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }

  getLineChartConfig(data: any, title: string): ChartConfiguration {
    return {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: title
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    };
  }

  getPieChartConfig(data: any, title: string): ChartConfiguration {
    return {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: title
          }
        }
      }
    };
  }

  getDoughnutChartConfig(data: any, title: string): ChartConfiguration {
    return {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: title
          }
        }
      }
    };
  }
}