import { Component } from '@angular/core';
//import { LiveMonitoringData, ProctorService } from '../../../service/proctor.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-monitor-test',
  standalone: true,
  imports: [],
  templateUrl: './monitor-test.component.html',
  styleUrl: './monitor-test.component.scss'
})
export class MonitorTestComponent {




  // monitoringData: LiveMonitoringData[] = [];
  // filteredData: LiveMonitoringData[] = [];
  
  // filters = {
  //   connectionQuality: 'all',
  //   webcamStatus: 'all',
  //   screenStatus: 'all'
  // };

  // isLoading = false;
  // private refreshSubscription?: Subscription;

  // constructor(private proctorService: ProctorService) {}

  // ngOnInit(): void {
  //   this.loadMonitoringData();
  //   this.startAutoRefresh();
  // }

  // ngOnDestroy(): void {
  //   this.refreshSubscription?.unsubscribe();
  // }

  // loadMonitoringData(): void {
  //   this.isLoading = true;
  //   this.proctorService.getLiveMonitoringData().subscribe({
  //     next: (data) => {
  //       this.monitoringData = data;
  //       this.applyFilters();
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading monitoring data:', error);
  //       this.isLoading = false;
  //     }
  //   });
  // }

  // applyFilters(): void {
  //   this.filteredData = this.monitoringData.filter(session => {
  //     let matches = true;

  //     if (this.filters.connectionQuality !== 'all') {
  //       const quality = session.connectionQuality;
  //       if (this.filters.connectionQuality === 'good' && quality < 80) matches = false;
  //       if (this.filters.connectionQuality === 'poor' && quality >= 80) matches = false;
  //     }

  //     if (this.filters.webcamStatus !== 'all' && 
  //         session.webcamStatus !== this.filters.webcamStatus) {
  //       matches = false;
  //     }

  //     if (this.filters.screenStatus !== 'all' && 
  //         session.screenStatus !== this.filters.screenStatus) {
  //       matches = false;
  //     }

  //     return matches;
  //   });
  // }

  // onFilterChange(): void {
  //   this.applyFilters();
  // }

  // private startAutoRefresh(): void {
  //   this.refreshSubscription = interval(5000).subscribe(() => {
  //     this.loadMonitoringData();
  //   });
  // }

  // getStatusColor(status: string): string {
  //   switch (status) {
  //     case 'ACTIVE': case 'SHARING': return 'success';
  //     case 'INACTIVE': case 'NOT_SHARING': return 'warning';
  //     case 'BLOCKED': return 'danger';
  //     default: return 'secondary';
  //   }
  // }

  // getConnectionQualityColor(quality: number): string {
  //   if (quality >= 90) return 'success';
  //   if (quality >= 80) return 'warning';
  //   if (quality >= 70) return 'danger';
  //   return 'dark';
  // }
}
