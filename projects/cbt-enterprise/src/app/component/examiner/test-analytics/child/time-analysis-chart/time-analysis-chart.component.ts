// components/time-analysis-chart.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';

export interface TimeAnalysisItem {
  timeRange: string;
  count: number;
}

@Component({
  selector: 'app-time-analysis-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  template: `
    <div class="time-analysis-chart">
      <div class="chart-header">
        <h4>Time Spent Analysis</h4>
        <span class="chart-subtitle">Distribution of time taken to complete the test</span>
      </div>
      
      <!-- ECharts Container -->
      <div echarts
           [options]="chartOption"
           class="chart-element"
           style="height: 300px; width: 100%;">
      </div>

      <!-- Time Statistics -->
      <div class="time-stats">
        <div class="stat-item">
          <span class="stat-label">Fastest Completion:</span>
          <span class="stat-value">{{ getFastestTime() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Average Time:</span>
          <span class="stat-value">{{ getAverageTime() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Slowest Completion:</span>
          <span class="stat-value">{{ getSlowestTime() }}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./time-analysis-chart.component.scss']
})
export class TimeAnalysisChartComponent implements OnChanges {
  @Input() timeAnalysis: TimeAnalysisItem[] = [];
  @Input() totalStudents: number = 0;

  chartOption: any = {};

  ngOnChanges(): void {
    this.updateChart();
  }
// Alternative series configuration for line chart
private updateChart(): void {
  if (!this.timeAnalysis.length) {
    this.setEmptyChart();
    return;
  }

  const sortedData = [...this.timeAnalysis].sort((a, b) => 
    this.parseTimeRange(a.timeRange) - this.parseTimeRange(b.timeRange)
  );

  const categories = sortedData.map(item => item.timeRange);
  const values = sortedData.map(item => item.count);

  this.chartOption = {
    tooltip: {
      trigger: 'axis',
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
      bottom: '15%',
      top: '10%',
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
      name: 'Number of Students'
    },
    series: [
      {
        name: 'Time Distribution',
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#339af0'
        },
        itemStyle: {
          color: '#339af0',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(51, 154, 240, 0.3)'
            }, {
              offset: 1, color: 'rgba(51, 154, 240, 0.1)'
            }]
          }
        }
      }
    ]
  };
}

  private setEmptyChart(): void {
    this.chartOption = {
      title: {
        text: 'No time analysis data available',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14,
          fontWeight: 'normal'
        }
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: []
    };
  }

  private getTimeColor(index: number, total: number): string {
    // Create a gradient from green (fast) to red (slow)
    const hue = (index / total) * 120; // 0 (red) to 120 (green) in HSL
    return `hsl(${120 - hue}, 70%, 45%)`; // Reverse so green is fast, red is slow
  }

  // Keep existing utility methods
  getPercentage(count: number): number {
    return this.totalStudents > 0 ? (count / this.totalStudents) * 100 : 0;
  }

  private parseTimeRange(range: string): number {
    const match = range.match(/(\d+)-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  getFastestTime(): string {
    if (!this.timeAnalysis.length) return 'N/A';
    const sorted = [...this.timeAnalysis].sort((a, b) => 
      this.parseTimeRange(a.timeRange) - this.parseTimeRange(b.timeRange)
    );
    return sorted[0].timeRange;
  }

  getSlowestTime(): string {
    if (!this.timeAnalysis.length) return 'N/A';
    const sorted = [...this.timeAnalysis].sort((a, b) => 
      this.parseTimeRange(a.timeRange) - this.parseTimeRange(b.timeRange)
    );
    return sorted[sorted.length - 1].timeRange;
  }

  getAverageTime(): string {
    if (!this.timeAnalysis.length) return 'N/A';
    
    let totalMinutes = 0;
    let totalStudents = 0;
    
    this.timeAnalysis.forEach(item => {
      const match = item.timeRange.match(/(\d+)-(\d+)/);
      if (match) {
        const avgTime = (parseInt(match[1]) + parseInt(match[2])) / 2;
        totalMinutes += avgTime * item.count;
        totalStudents += item.count;
      }
    });

    const average = totalStudents > 0 ? totalMinutes / totalStudents : 0;
    return `${Math.round(average)} min`;
  }
}