// // examiner-dashboard.component.ts
// import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
// import { DashboardService, DashboardStats, PlatformOverview } from '../../../service/dashboard.service';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { NgxEchartsDirective } from 'ngx-echarts'; // Import directive directly
// import { EChartsOption } from 'echarts';

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './examiner-dashboard.component.html',
//   styleUrls: ['./examiner-dashboard.component.scss'],
//   imports: [CommonModule, RouterModule, NgxEchartsDirective], // Use directive directly
//   schemas: [CUSTOM_ELEMENTS_SCHEMA],
// })
// export class ExaminerDashboardComponent implements OnInit {
//   stats: DashboardStats = {} as DashboardStats;
//   overview: PlatformOverview = {} as PlatformOverview;
//   loading = true;
//   currentView: 'overview' | 'analytics' | 'management' = 'overview';
  
//   // ECharts options
//   scoreDistributionOptions: EChartsOption = {};
//   performanceTrendOptions: EChartsOption = {};
//   testStatusOptions: EChartsOption = {};
//   questionTypeOptions: EChartsOption = {};

//   // Chart instances for export functionality
//   private chartInstances: { [key: string]: any } = {};

//   constructor(private dashboardService: DashboardService) {}

//   ngOnInit() {
//     this.loadDashboardData();
//     this.initializeCharts();
//   }

//   loadDashboardData() {
//     this.dashboardService.getDashboardStats().subscribe({
//       next: (data) => {
//         this.stats = data;
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error loading dashboard:', error);
//         this.loading = false;
//       }
//     });

//     this.dashboardService.getPlatformOverview().subscribe({
//       next: (data) => {
//         this.overview = data;
//         this.updateChartsWithData(data);
//       },
//       error: (error) => {
//         console.error('Error loading platform overview:', error);
//       }
//     });
//   }

//   initializeCharts() {
//     // Score Distribution Chart (Column Chart)
//     this.scoreDistributionOptions = {
//       backgroundColor: 'transparent',
//       title: {
//         text: 'Score Distribution',
//         left: 'left',
//         textStyle: {
//           color: '#233554',
//           fontWeight: 'bold', // FIX: Changed from '600' to 'bold'
//           fontSize: 16,
//           fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
//         }
//       },
//       color: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'],
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         },
//         formatter: (params: any) => {
//           const data = params[0];
//           return `<div style="font-size: 12px; margin-bottom: 4px;">${data.name}</div>
//                   <div>${data.seriesName}: <b>${data.value} students</b></div>`;
//         }
//       },
//       grid: {
//         left: '3%',
//         right: '4%',
//         bottom: '3%',
//         containLabel: true
//       },
//       xAxis: {
//         type: 'category',
//         data: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
//         axisLine: {
//           lineStyle: {
//             color: '#e0e0e0'
//           }
//         },
//         axisLabel: {
//           color: '#666'
//         }
//       },
//       yAxis: {
//         type: 'value',
//         name: 'Number of Students',
//         nameTextStyle: {
//           color: '#666'
//         },
//         axisLine: {
//           lineStyle: {
//             color: '#e0e0e0'
//           }
//         },
//         splitLine: {
//           lineStyle: {
//             color: 'rgba(0,0,0,0.1)',
//             type: 'dashed'
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Students',
//           type: 'bar',
//           data: [5, 10, 15, 25, 8],
//           itemStyle: {
//             borderRadius: [4, 4, 0, 0]
//           },
//           label: {
//             show: true,
//             position: 'top',
//             color: '#333',
//             fontWeight: 'normal' // FIX: Added proper fontWeight
//           }
//         }
//       ]
//     };

//     // Test Status Overview Chart (Pie Chart)
//     this.testStatusOptions = {
//       backgroundColor: 'transparent',
//       title: {
//         text: 'Test Status Overview',
//         left: 'left',
//         textStyle: {
//           color: '#233554',
//           fontWeight: 'bold', // FIX: Changed from '600' to 'bold'
//           fontSize: 16,
//           fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
//         }
//       },
//       color: ['#198754', '#ffc107', '#6c757d', '#0dcaf0'],
//       tooltip: {
//         trigger: 'item',
//         formatter: '{a} <br/>{b}: {c} ({d}%)'
//       },
//       legend: {
//         orient: 'vertical',
//         right: 10,
//         top: 'center',
//         textStyle: {
//           color: '#666',
//           fontWeight: 'normal' // FIX: Added proper fontWeight
//         }
//       },
//       series: [
//         {
//           name: 'Tests',
//           type: 'pie',
//           radius: ['40%', '70%'],
//           avoidLabelOverlap: false,
//           itemStyle: {
//             borderColor: '#fff',
//             borderWidth: 2
//           },
//           label: {
//             show: true,
//             formatter: '{b}: {d}%',
//             color: 'white',
//             fontWeight: 'bold' // FIX: Changed from 'bold' string to proper value
//           },
//           emphasis: {
//             label: {
//               show: true,
//               fontSize: 14, // FIX: Changed from string '14' to number 14
//               fontWeight: 'bold'
//             }
//           },
//           labelLine: {
//             show: true
//           },
//           data: [
//             { value: 45, name: 'Published' },
//             { value: 25, name: 'Draft' },
//             { value: 15, name: 'Archived' },
//             { value: 15, name: 'Scheduled' }
//           ]
//         }
//       ]
//     };

//     // Performance Trends Chart (Line Chart)
//     this.performanceTrendOptions = {
//       backgroundColor: 'transparent',
//       title: {
//         text: 'Performance Trends',
//         left: 'left',
//         textStyle: {
//           color: '#233554',
//           fontWeight: 'bold', // FIX: Changed from '600' to 'bold'
//           fontSize: 16,
//           fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
//         }
//       },
//       color: ['#0d6efd', '#198754', '#ffc107'],
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'cross'
//         }
//       },
//       legend: {
//         data: ['Mathematics', 'Science', 'English'],
//         top: 'bottom',
//         textStyle: {
//           color: '#666',
//           fontWeight: 'normal' // FIX: Added proper fontWeight
//         }
//       },
//       grid: {
//         left: '3%',
//         right: '4%',
//         bottom: '15%',
//         containLabel: true
//       },
//       xAxis: {
//         type: 'category',
//         boundaryGap: false,
//         data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//         axisLine: {
//           lineStyle: {
//             color: '#e0e0e0'
//           }
//         }
//       },
//       yAxis: {
//         type: 'value',
//         name: 'Average Score (%)',
//         min: 0,
//         max: 100,
//         axisLine: {
//           lineStyle: {
//             color: '#e0e0e0'
//           }
//         },
//         splitLine: {
//           lineStyle: {
//             color: 'rgba(0,0,0,0.1)',
//             type: 'dashed'
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Mathematics',
//           type: 'line',
//           smooth: true,
//           data: [65, 68, 72, 75, 78, 76, 80, 82, 85, 83, 87, 90],
//           symbol: 'circle',
//           symbolSize: 6,
//           lineStyle: {
//             width: 3
//           }
//         },
//         {
//           name: 'Science',
//           type: 'line',
//           smooth: true,
//           data: [70, 72, 75, 73, 76, 78, 80, 82, 84, 86, 88, 85],
//           symbol: 'circle',
//           symbolSize: 6,
//           lineStyle: {
//             width: 3
//           }
//         },
//         {
//           name: 'English',
//           type: 'line',
//           smooth: true,
//           data: [68, 70, 72, 75, 77, 75, 78, 80, 82, 84, 86, 88],
//           symbol: 'circle',
//           symbolSize: 6,
//           lineStyle: {
//             width: 3
//           }
//         }
//       ]
//     };

//     // Question Type Distribution Chart (Bar Chart)
//     this.questionTypeOptions = {
//       backgroundColor: 'transparent',
//       title: {
//         text: 'Question Type Distribution',
//         left: 'left',
//         textStyle: {
//           color: '#233554',
//           fontWeight: 'bold', // FIX: Changed from '600' to 'bold'
//           fontSize: 16,
//           fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
//         }
//       },
//       color: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'],
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         },
//         formatter: '{b}: {c} questions'
//       },
//       grid: {
//         left: '3%',
//         right: '4%',
//         bottom: '3%',
//         containLabel: true
//       },
//       xAxis: {
//         type: 'value',
//         axisLine: {
//           lineStyle: {
//             color: '#e0e0e0'
//           }
//         },
//         splitLine: {
//           lineStyle: {
//             color: 'rgba(0,0,0,0.1)',
//             type: 'dashed'
//           }
//         }
//       },
//       yAxis: {
//         type: 'category',
//         data: ['Multiple Choice', 'True/False', 'Fill in Blank', 'Essay', 'Multiple Select'],
//         axisLine: {
//           lineStyle: {
//             color: '#e0e0e0'
//           }
//         }
//       },
//       series: [
//         {
//           name: 'Questions',
//           type: 'bar',
//           data: [120, 85, 65, 45, 30],
//           itemStyle: {
//             borderRadius: [0, 4, 4, 0]
//           },
//           label: {
//             show: true,
//             position: 'right',
//             color: '#333',
//             fontWeight: 'normal' // FIX: Added proper fontWeight
//           }
//         }
//       ]
//     };
//   }

//   updateChartsWithData(overview: PlatformOverview) {
//     // Update charts with real data from the overview
//     if (overview.testsByStatus) {
//       this.testStatusOptions = {
//         ...this.testStatusOptions,
//         series: [{
//           ...(this.testStatusOptions.series as any[])[0],
//           data: overview.testsByStatus.map((status: any) => ({
//             value: status.count,
//             name: status.status
//           }))
//         }]
//       };
//     }

//     if (overview.studentPerformance) {
//       this.scoreDistributionOptions = {
//         ...this.scoreDistributionOptions,
//         series: [{
//           ...(this.scoreDistributionOptions.series as any[])[0],
//           data: overview.studentPerformance.map((perf: any) => perf.count)
//         }]
//       };
//     }

//     if (overview.questionDistribution) {
//       this.questionTypeOptions = {
//         ...this.questionTypeOptions,
//         series: [{
//           ...(this.questionTypeOptions.series as any[])[0],
//           data: overview.questionDistribution.map((q: any) => q.count)
//         }]
//       };
//     }
//   }

//   // Chart event handlers
//   onChartInit(ec: any, chartType: string) {
//     this.chartInstances[chartType] = ec;
//   }

//   // Enhanced export functionality
//   exportChart(chartType: string) {
//     const chartInstance = this.chartInstances[chartType];
//     if (chartInstance) {
//       const chartDataUrl = chartInstance.getDataURL({
//         type: 'png',
//         pixelRatio: 2,
//         backgroundColor: '#fff'
//       });
      
//       // Create download link
//       const link = document.createElement('a');
//       link.download = `${chartType}-${new Date().toISOString().split('T')[0]}.png`;
//       link.href = chartDataUrl;
//       link.click();
//     } else {
//       console.warn(`Chart instance for ${chartType} not found`);
//     }
//   }

//   switchView(view: 'overview' | 'analytics' | 'management') {
//     this.currentView = view;
//   }

//   refreshDashboard() {
//     this.loading = true;
//     this.loadDashboardData();
//   }

//   getRecentActivities() {
//     return this.overview?.recentActivity || [];
//   }

//   hasRecentActivities() {
//     return this.overview?.recentActivity && this.overview.recentActivity.length > 0;
//   }
// }










// examiner-dashboard.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { DashboardService, DashboardStats, PlatformOverview, ChartData, ActivityData } from '../../../service/dashboard.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './examiner-dashboard.component.html',
  styleUrls: ['./examiner-dashboard.component.scss'],
  imports: [CommonModule, RouterModule, NgxEchartsDirective, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExaminerDashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {} as DashboardStats;
  overview: PlatformOverview = {} as PlatformOverview;
  loading = true;
  currentView: 'overview' | 'analytics' | 'management' = 'overview';
  dateRange: string = 'month';
  
  // ECharts options
  scoreDistributionOptions: EChartsOption = {};
  performanceTrendOptions: EChartsOption = {};
  testStatusOptions: EChartsOption = {};
  questionTypeOptions: EChartsOption = {};
  enrollmentTrendOptions: EChartsOption = {};
  testPerformanceOptions: EChartsOption = {};

  private chartInstances: { [key: string]: any } = {};
  private subscriptions: Subscription = new Subscription();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadDashboardData() {
    this.loading = true;
    
    const statsSub = this.dashboardService.getDashboardStats(this.dateRange).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.loading = false;
      }
    });

    const overviewSub = this.dashboardService.getPlatformOverview(this.dateRange).subscribe({
      next: (data) => {
        this.overview = data;
        this.updateChartsWithRealData();
      },
      error: (error) => {
        console.error('Error loading platform overview:', error);
      }
    });

    this.subscriptions.add(statsSub);
    this.subscriptions.add(overviewSub);
  }

  updateChartsWithRealData() {
    this.updateScoreDistributionChart();
    this.updateTestStatusChart();
    this.updatePerformanceTrendsChart();
    this.updateQuestionTypeChart();
    this.updateEnrollmentTrendsChart();
    this.updateTestPerformanceChart();
  }

  updateScoreDistributionChart() {
    const data = this.overview.scoreDistribution || [];
    
    this.scoreDistributionOptions = {
      backgroundColor: 'transparent',
      title: {
        text: 'Score Distribution',
        left: 'left',
        textStyle: {
          color: '#233554',
          fontWeight: 'bold',
          fontSize: 16,
        }
      },
      color: data.map((item: ChartData) => item.color || '#0d6efd'),
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          return `<div style="font-size: 12px; margin-bottom: 4px;">${data.name}</div>
                  <div>Students: <b>${data.value}</b></div>`;
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
        data: data.map((item: ChartData) => item.name),
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: { color: '#666', rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: 'Number of Students',
        nameTextStyle: { color: '#666' },
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.1)', type: 'dashed' } }
      },
      series: [{
        name: 'Students',
        type: 'bar',
        data: data.map((item: ChartData) => item.value),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: '#333',
          fontWeight: 'normal'
        }
      }]
    };
  }

  updateTestStatusChart() {
    const data = this.overview.testsByStatus || [];
    
    this.testStatusOptions = {
      backgroundColor: 'transparent',
      title: {
        text: 'Test Status Overview',
        left: 'left',
        textStyle: {
          color: '#233554',
          fontWeight: 'bold',
          fontSize: 16,
        }
      },
      color: data.map((item: ChartData) => item.color || '#0d6efd'),
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: '#666', fontWeight: 'normal' }
      },
      series: [{
        name: 'Tests',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          formatter: '{b}: {d}%',
          color: 'white',
          fontWeight: 'bold'
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' }
        },
        labelLine: { show: true },
        data: data.map((item: ChartData) => ({
          value: item.value,
          name: item.name
        }))
      }]
    };
  }

  updatePerformanceTrendsChart() {
    const trends = this.overview.enrollmentTrends || [];
    
    this.performanceTrendOptions = {
      backgroundColor: 'transparent',
      title: {
        text: 'Enrollment Trends',
        left: 'left',
        textStyle: {
          color: '#233554',
          fontWeight: 'bold',
          fontSize: 16,
        }
      },
      color: ['#0d6efd'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trends.map(trend => trend.date),
        axisLine: { lineStyle: { color: '#e0e0e0' } }
      },
      yAxis: {
        type: 'value',
        name: 'Enrollments',
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.1)', type: 'dashed' } }
      },
      series: [{
        name: 'Enrollments',
        type: 'line',
        smooth: true,
        data: trends.map(trend => trend.value),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(13, 110, 253, 0.3)'
            }, {
              offset: 1, color: 'rgba(13, 110, 253, 0.1)'
            }]
          }
        }
      }]
    };
  }

  updateQuestionTypeChart() {
    const data = this.overview.questionDistribution || [];
    
    this.questionTypeOptions = {
      backgroundColor: 'transparent',
      title: {
        text: 'Question Type Distribution',
        left: 'left',
        textStyle: {
          color: '#233554',
          fontWeight: 'bold',
          fontSize: 16,
        }
      },
      color: data.map((item: ChartData) => item.color || '#0d6efd'),
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: {c} questions'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.1)', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: data.map((item: ChartData) => item.name),
        axisLine: { lineStyle: { color: '#e0e0e0' } }
      },
      series: [{
        name: 'Questions',
        type: 'bar',
        data: data.map((item: ChartData) => item.value),
        itemStyle: { borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          color: '#333',
          fontWeight: 'normal'
        }
      }]
    };
  }

  updateEnrollmentTrendsChart() {
    const trends = this.overview.enrollmentTrends || [];
    
    this.enrollmentTrendOptions = {
      backgroundColor: 'transparent',
      title: {
        text: 'Enrollment Trends',
        left: 'left',
        textStyle: {
          color: '#233554',
          fontWeight: 'bold',
          fontSize: 16,
        }
      },
      color: ['#198754'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: trends.map(trend => trend.date),
        axisLine: { lineStyle: { color: '#e0e0e0' } }
      },
      yAxis: {
        type: 'value',
        name: 'Enrollments',
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.1)', type: 'dashed' } }
      },
      series: [{
        name: 'Enrollments',
        type: 'bar',
        data: trends.map(trend => trend.value),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: '#333'
        }
      }]
    };
  }

  updateTestPerformanceChart() {
    const data = this.overview.testPerformance || [];
    
    this.testPerformanceOptions = {
      backgroundColor: 'transparent',
      title: {
        text: 'Test Performance',
        left: 'left',
        textStyle: {
          color: '#233554',
          fontWeight: 'bold',
          fontSize: 16,
        }
      },
      color: data.map((item: ChartData) => item.color || '#0d6efd'),
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          return `<div style="font-size: 12px; margin-bottom: 4px;">${data.name}</div>
                  <div>Average Score: <b>${data.value}%</b></div>`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map((item: ChartData) => 
          item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name
        ),
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        axisLabel: { color: '#666', rotate: 45 }
      },
      yAxis: {
        type: 'value',
        name: 'Average Score (%)',
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: '#e0e0e0' } },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.1)', type: 'dashed' } }
      },
      series: [{
        name: 'Average Score',
        type: 'bar',
        data: data.map((item: ChartData) => item.value),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#333'
        }
      }]
    };
  }

  // Chart event handlers
  onChartInit(ec: any, chartType: string) {
    this.chartInstances[chartType] = ec;
  }

  exportChart(chartType: string) {
    const chartInstance = this.chartInstances[chartType];
    if (chartInstance) {
      const chartDataUrl = chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      
      const link = document.createElement('a');
      link.download = `${chartType}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = chartDataUrl;
      link.click();
    }
  }

  switchView(view: 'overview' | 'analytics' | 'management') {
    this.currentView = view;
  }

  refreshDashboard() {
    this.loading = true;
    this.loadDashboardData();
  }

  onDateRangeChange(range: string) {
    this.dateRange = range;
    this.refreshDashboard();
  }

  getRecentActivities(): ActivityData[] {
    return this.overview?.recentActivity || [];
  }

  hasRecentActivities(): boolean {
    return this.overview?.recentActivity && this.overview.recentActivity.length > 0;
  }
}