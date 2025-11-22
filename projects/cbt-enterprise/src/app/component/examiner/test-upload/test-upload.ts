import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../service/exam.servise';
import { ExaminerService } from '../../../service/exaimner.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'test-upload',
  imports: [FormsModule, CommonModule],
  templateUrl: './test-upload.html',
  styleUrl: './test-upload.scss'
})
export class TestUpload {

  @Output() uploadComplete = new EventEmitter<void>();

  selectedFile: File | null = null;
  templateFormat: 'excel' | 'csv' = 'excel';
  isUploading = false;
  isDragOver = false;

  // Success/Error states
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';
  uploadProgress = 0;

  constructor(private examinerService: ExaminerService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  private validateAndSetFile(file: File) {
    // Clear previous alerts
    this.dismissAlert();

    const validTypes = ['.csv', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (validTypes.includes(fileExtension || '')) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.showErrorAlert('File size must be less than 5MB.');
        return;
      }
      this.selectedFile = file;
    } else {
      this.showErrorAlert('Please select a valid CSV or Excel file.');
    }
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.dismissAlert();
  }

  getFileSize(bytes: number | undefined): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  upload() {
    if (!this.selectedFile) {
      this.showErrorAlert("Please select a file!");
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.dismissAlert();

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.examinerService.uploadTest(this.selectedFile).subscribe({
      next: (response: any) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        
        setTimeout(() => {
          this.handleUploadSuccess(response);
        }, 500);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.handleUploadError(err);
      }
    });
  }

  private handleUploadSuccess(response: any): void {
    this.isUploading = false;
    this.selectedFile = null;
    
    let message = 'Tests uploaded successfully!';
    if (typeof response === 'string') {
      message = response;
    } else if (response?.message) {
      message = response.message;
    } else if (response?.uploadedCount !== undefined) {
      message = `${response.uploadedCount} tests uploaded successfully!`;
    }
    
    this.showSuccessAlert(message);
    this.uploadComplete.emit();
    
    // Auto-dismiss modal after success
    setTimeout(() => {
      this.dismissModal();
    }, 2000);
  }

  private handleUploadError(error: any): void {
    this.isUploading = false;
    
    let errorMsg = 'Upload failed! ';
    
    if (error.error?.message) {
      errorMsg += error.error.message;
    } else if (error.message) {
      errorMsg += error.message;
    } else if (error.status === 413) {
      errorMsg += 'File too large. Please use a smaller file.';
    } else if (error.status === 415) {
      errorMsg += 'Unsupported file type.';
    } else if (error.status === 400) {
      errorMsg += 'Invalid file format. Please check the template.';
    } else {
      errorMsg += 'Please try again.';
    }
    
    this.showErrorAlert(errorMsg);
  }

  downloadTemplate() {
    this.examinerService.downloadTemplate(this.templateFormat).subscribe({
      next: (blob) => {
        const extension = this.templateFormat === 'excel' ? 'xlsx' : 'csv';
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = `test-template.${extension}`;
        a.click();
        a.remove();
        window.URL.revokeObjectURL(fileUrl);
        
        this.showSuccessAlert('Template download started!');
      },
      error: (err) => {
        this.showErrorAlert('Download failed: ' + (err.message || 'Please try again.'));
      }
    });
  }

  // Alert methods
  private showSuccessAlert(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;
    this.showError = false;
  }

  private showErrorAlert(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    this.showSuccess = false;
  }

  dismissAlert(): void {
    this.showSuccess = false;
    this.showError = false;
  }

  private dismissModal(): void {
    const modal = document.getElementById('uploadBulkModal');
    if (modal) {
      const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }
    }
  }
}