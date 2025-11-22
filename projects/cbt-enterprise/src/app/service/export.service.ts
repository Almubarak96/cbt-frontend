
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// If you want to generate files on client side, you can use these libraries:
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

export interface ExportData {
  analytics: any;
  filters: any;
  exportedAt: string;
}

export interface ExportOptions {
  includeCharts?: boolean;
  includeRawData?: boolean;
  format?: 'detailed' | 'summary';
  fileName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private http = inject(HttpClient);

  /**
   * Export analytics data in various formats
   */
  exportAnalytics(data: ExportData, format: 'csv' | 'excel' | 'pdf' | string): Observable<Blob> {
    switch (format) {
      case 'csv':
        return this.exportToCsv(data);
      case 'excel':
        return this.exportToExcel(data);
      case 'pdf':
        return this.exportToPdf(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to CSV format
   */
  private exportToCsv(data: ExportData): Observable<Blob> {
    // For now, return a mock Blob - implement actual CSV generation
    const csvContent = this.generateCsvContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return of(blob);
    
    // If you have a backend API for CSV export:
    // return this.http.post('/api/analytics/export/csv', data, {
    //   responseType: 'blob'
    // });
  }

  /**
   * Export to Excel format
   */
  private exportToExcel(data: ExportData): Observable<Blob> {
    // For now, return a mock Blob - implement actual Excel generation
    // You can use libraries like xlsx for client-side generation
    const excelContent = this.generateExcelContent(data);
    const blob = new Blob([excelContent], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    return of(blob);
    
    // If you have a backend API for Excel export:
    // return this.http.post('/api/analytics/export/excel', data, {
    //   responseType: 'blob'
    // });
  }

  /**
   * Export to PDF format
   */
  private exportToPdf(data: ExportData): Observable<Blob> {
    // For now, return a mock Blob - implement actual PDF generation
    // You can use libraries like jspdf for client-side generation
    const pdfContent = this.generatePdfContent(data);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    return of(blob);
    
    // If you have a backend API for PDF export:
    // return this.http.post('/api/analytics/export/pdf', data, {
    //   responseType: 'blob'
    // });
  }

  /**
   * Generate CSV content from analytics data
   */
  private generateCsvContent(data: ExportData): string {
    const { analytics, filters } = data;
    
    let csvContent = 'Test Analytics Report\n';
    csvContent += `Generated: ${new Date(data.exportedAt).toLocaleString()}\n`;
    csvContent += `Test: ${analytics.test.title}\n\n`;
    
    // Summary section
    csvContent += 'SUMMARY\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Students,${analytics.summary.totalStudents}\n`;
    csvContent += `Completed Students,${analytics.summary.completedStudents}\n`;
    csvContent += `Average Score,${analytics.summary.averageScore}\n`;
    csvContent += `Pass Rate,${analytics.summary.passRate}\n\n`;
    
    // Student performance section
    csvContent += 'STUDENT PERFORMANCE\n';
    csvContent += 'Student ID,Name,Score,Time Spent,Status,Submitted At\n';
    analytics.studentPerformance.forEach((student: any) => {
      csvContent += `"${student.studentId}","${student.name}",${student.score},${student.timeSpent},${student.status},"${student.submittedAt}"\n`;
    });
    
    csvContent += '\nQUESTION PERFORMANCE\n';
    csvContent += 'Question ID,Text,Correct,Incorrect,Accuracy,Avg Time,Difficulty\n';
    analytics.questionAnalysis.forEach((question: any) => {
      const accuracy = (question.correctAnswers / (question.correctAnswers + question.incorrectAnswers)) * 100;
      csvContent += `"${question.questionId}","${question.text.replace(/"/g, '""')}",${question.correctAnswers},${question.incorrectAnswers},${accuracy.toFixed(1)},${question.averageTime},${question.difficulty}\n`;
    });
    
    return csvContent;
  }

  /**
   * Generate Excel content (simplified - in real app, use xlsx library)
   */
  private generateExcelContent(data: ExportData): ArrayBuffer {
    // This is a simplified version. In a real application, you would use:
    // const workbook = XLSX.utils.book_new();
    // const worksheet = XLSX.utils.json_to_sheet(data);
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');
    // return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Mock implementation
    return new ArrayBuffer(0);
  }

  /**
   * Generate PDF content (simplified - in real app, use jspdf)
   */
  private generatePdfContent(data: ExportData): ArrayBuffer {
    // This is a simplified version. In a real application, you would use:
    // const doc = new jsPDF();
    // doc.text('Test Analytics Report', 20, 20);
    // autoTable(doc, { html: '#analytics-table' });
    // return doc.output('arraybuffer');
    
    // Mock implementation
    return new ArrayBuffer(0);
  }

  /**
   * Download file from blob
   */
  downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export student-specific report
   */
  exportStudentReport(studentId: string, testId: number, format: 'pdf' | 'csv'): Observable<Blob> {
    const payload = { studentId, testId };
    
    const endpoint = format === 'pdf' 
      ? '/api/reports/student/pdf' 
      : '/api/reports/student/csv';
    
    return this.http.post(endpoint, payload, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error exporting student report:', error);
        throw new Error('Failed to export student report');
      })
    );
  }

  /**
   * Export comprehensive test report
   */
  exportComprehensiveReport(testId: number, options: ExportOptions = {}): Observable<Blob> {
    const payload = {
      testId,
      options: {
        includeCharts: options.includeCharts ?? true,
        includeRawData: options.includeRawData ?? false,
        format: options.format ?? 'detailed'
      }
    };
    
    return this.http.post('/api/reports/comprehensive/pdf', payload, {
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error exporting comprehensive report:', error);
        throw new Error('Failed to export comprehensive report');
      })
    );
  }

  /**
   * Get export history for a test
   */
  getExportHistory(testId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/exports/history/${testId}`).pipe(
      catchError(error => {
        console.error('Error fetching export history:', error);
        return of([]);
      })
    );
  }
}