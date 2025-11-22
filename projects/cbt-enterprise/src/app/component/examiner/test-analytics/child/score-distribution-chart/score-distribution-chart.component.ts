// // components/score-distribution-chart.component.ts
// import { Component, Input, OnChanges, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NgxEchartsModule } from 'ngx-echarts';

// export interface ScoreDistributionItem {
//   score: number;
//   count: number;
// }

// @Component({
//   selector: 'app-score-distribution-chart',
//   standalone: true,
//   imports: [CommonModule, NgxEchartsModule],
//   template: `
//     <div class="score-distribution-chart">
//       <div class="chart-header">
//         <h4>Score Distribution</h4>
//         <span class="chart-subtitle">How students performed across score ranges</span>
//       </div>
      
//       <!-- ECharts Component -->
//       <div echarts 
//            [options]="chartOption" 
//            [loading]="isLoading"
//            [merge]="updateOptions"
//            class="chart-element"
//            style="height: 400px; width: 100%;">
//       </div>

//       <div class="chart-legend">
//         <div class="legend-item">
//           <span class="legend-color excellent"></span>
//           <span>Excellent (80-100%)</span>
//         </div>
//         <div class="legend-item">
//           <span class="legend-color good"></span>
//           <span>Good (60-79%)</span>
//         </div>
//         <div class="legend-item">
//           <span class="legend-color average"></span>
//           <span>Average (40-59%)</span>
//         </div>
//         <div class="legend-item">
//           <span class="legend-color poor"></span>
//           <span>Needs Improvement (0-39%)</span>
//         </div>
//       </div>
//     </div>
//   `,
//   styleUrls: ['./score-distribution-chart.component.scss']
// })
// export class ScoreDistributionChartComponent implements OnInit, OnChanges {
//   @Input() scoreDistribution: ScoreDistributionItem[] = [];
//   @Input() totalStudents: number = 0;

//   chartOption: any = {};
//   isLoading = false;
//   updateOptions: any = {};

//   ngOnInit(): void {
//     this.initChart();
//   }

//   ngOnChanges(): void {
//     if (this.scoreDistribution.length > 0) {
//       this.updateChart();
//     }
//   }

//   private initChart(): void {
//     this.isLoading = true;
    
//     // Initial empty chart
//     this.chartOption = {
//       title: {
//         text: 'Score Distribution',
//         left: 'center',
//         textStyle: {
//           fontSize: 16,
//           fontWeight: 'bold'
//         }
//       },
//       tooltip: {
//         trigger: 'axis',
//         axisPointer: {
//           type: 'shadow'
//         }
//       },
//       grid: {
//         left: '3%',
//         right: '4%',
//         bottom: '10%',
//         top: '15%',
//         containLabel: true
//       },
//       xAxis: {
//         type: 'category',
//         data: [],
//         axisLabel: {
//           rotate: 45
//         }
//       },
//       yAxis: {
//         type: 'value',
//         name: 'Number of Students'
//       },
//       series: [
//         {
//           name: 'Students',
//           type: 'bar',
//           data: [],
//           itemStyle: {
//             color: (params: any) => this.getScoreColor(params.dataIndex)
//           }
//         }
//       ],
//       animation: true,
//       animationDuration: 1000
//     };

//     this.isLoading = false;
//   }

//   private updateChart(): void {
//     if (!this.scoreDistribution.length) return;

//     // Sort data by score
//     const sortedData = [...this.scoreDistribution].sort((a, b) => a.score - b.score);
    
//     const categories = sortedData.map(item => `${item.score}%`);
//     const values = sortedData.map(item => item.count);

//     this.updateOptions = {
//       xAxis: {
//         data: categories
//       },
//       series: [
//         {
//           data: values.map((value, index) => ({
//             value: value,
//             itemStyle: {
//               color: this.getScoreColor(index)
//             }
//           }))
//         }
//       ]
//     };
//   }

//   private getScoreColor(index: number): string {
//     const score = this.scoreDistribution[index]?.score;
//     if (score >= 80) return '#28a745'; // Excellent - green
//     if (score >= 60) return '#17a2b8'; // Good - blue
//     if (score >= 40) return '#ffc107'; // Average - yellow
//     return '#dc3545'; // Poor - red
//   }

//   // Keep existing methods for compatibility
//   getPercentage(count: number): number {
//     return this.totalStudents > 0 ? (count / this.totalStudents) * 100 : 0;
//   }

//   getScoreClass(score: number): string {
//     if (score >= 80) return 'excellent';
//     if (score >= 60) return 'good';
//     if (score >= 40) return 'average';
//     return 'poor';
//   }
// }


// components/score-distribution-chart.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';

export interface ScoreDistributionItem {
  score: number;
  count: number;
}

@Component({
  selector: 'app-score-distribution-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  template: `
    <div class="score-distribution-chart">
      <div class="chart-header">
        <h4>Score Distribution</h4>
        <span class="chart-subtitle">How students performed across score ranges</span>
      </div>
      
      <div echarts
           [options]="chartOption"
           class="chart-element"
           style="height: 250px; width: 100%;">
      </div>

      <div class="chart-legend">
        <!-- Your existing legend -->
      </div>
    </div>
  `,
  styleUrls: ['./score-distribution-chart.component.scss']
})
export class ScoreDistributionChartComponent implements OnChanges {
  @Input() scoreDistribution: ScoreDistributionItem[] = [];
  @Input() totalStudents: number = 0;

  chartOption: any = {};

  ngOnChanges(): void {
    this.updateChart();
  }

  private updateChart(): void {
    if (!this.scoreDistribution.length) return;

    const sortedData = [...this.scoreDistribution].sort((a, b) => a.score - b.score);
    const categories = sortedData.map(item => `${item.score}%`);
    const values = sortedData.map(item => item.count);

    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0];
          const percentage = this.getPercentage(data.value);
          return `
            <strong>${data.name}</strong><br/>
            Students: ${data.value}<br/>
            Percentage: ${percentage.toFixed(1)}%
          `;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Students'
      },
      series: [
        {
          name: 'Score Distribution',
          type: 'bar',
          data: values.map((value, index) => ({
            value: value,
            itemStyle: {
              color: this.getScoreColor(sortedData[index].score)
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
        }
      ]
    };
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#17a2b8';
    if (score >= 40) return '#ffc107';
    return '#dc3545';
  }

  getPercentage(count: number): number {
    return this.totalStudents > 0 ? (count / this.totalStudents) * 100 : 0;
  }
}