import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExaminerService } from '../../../service/exaimner.service';
import { EnrollmentRequest, EnrollmentService, Student } from '../../../service/enrollment.service';

@Component({
  selector: 'app-enroll-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './enroll-candidate.component.html',
  styleUrls: ['./enroll-candidate.component.scss']
})
export class EnrollCandidateComponent implements OnInit {
  enrollmentForm: FormGroup;
  testId!: number;
  test: any;
  
  // Data
  allStudents: Student[] = [];
  enrolledStudents: Student[] = [];
  availableStudents: Student[] = [];
  
  // UI State
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  
  // Search & Filter
  departments: string[] = [];
  
  // Bulk Operations
  selectedStudents: Set<number> = new Set();
  selectAll = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examinerService: ExaminerService,
    private enrollmentService: EnrollmentService
  ) {
    this.enrollmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Optional: Uncomment to force mock data for development
    // this.enrollmentService.useMockData();
    
    this.loadTestDetails();
    this.loadDepartments();
    this.loadAllData();
  }

  createForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      department: ['all'],
      enrollmentDate: [new Date().toISOString().split('T')[0], Validators.required],
      notificationGroup: this.fb.group({
        sendNotification: [true],
        notificationMessage: ['You have been enrolled in a new test. Please check your dashboard.']
      })
    });
  }

  loadAllData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    Promise.all([
      this.loadStudents(),
      this.loadEnrolledStudents()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  loadTestDetails(): void {
    // For now, create a mock test object
    this.test = {
      id: this.testId,
      title: `Mathematics Assessment ${this.testId}`,
      durationMinutes: 60,
      numberOfQuestions: 25,
      totalMarks: 100,
      published: true
    };
  }

  loadDepartments(): void {
    this.enrollmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  loadStudents(): Promise<void> {
    return new Promise((resolve) => {
      this.enrollmentService.getAllStudents().subscribe({
        next: (students) => {
          this.allStudents = students.map(student => ({
            ...student,
            enrolled: false
          }));
          this.filterStudents();
          resolve();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load students';
          console.error('Error loading students:', error);
          resolve();
        }
      });
    });
  }

  loadEnrolledStudents(): Promise<void> {
    return new Promise((resolve) => {
      this.enrollmentService.getEnrolledStudents(this.testId).subscribe({
        next: (enrolledStudents) => {
          this.enrolledStudents = enrolledStudents.map(student => ({
            ...student,
            enrolled: true
          }));
          
          this.allStudents = this.allStudents.map(student => {
            const isEnrolled = this.enrolledStudents.some(es => es.id === student.id);
            return { ...student, enrolled: isEnrolled };
          });
          
          this.filterStudents();
          resolve();
        },
        error: (error) => {
          this.errorMessage = 'Failed to load enrolled students';
          console.error('Error loading enrolled students:', error);
          resolve();
        }
      });
    });
  }

  filterStudents(): void {
    const searchTerm = this.enrollmentForm.get('searchTerm')?.value?.toLowerCase() || '';
    const department = this.enrollmentForm.get('department')?.value;

    this.availableStudents = this.allStudents.filter(student => {
      const matchesSearch = !searchTerm || 
        student.name.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.studentId.toLowerCase().includes(searchTerm);
      
      const matchesDepartment = department === 'all' || student.department === department;
      
      return matchesSearch && matchesDepartment && !student.enrolled;
    });
    
    this.updateSelectAllState();
  }

  // Individual Student Operations
  enrollStudent(student: Student): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const notificationGroup = this.enrollmentForm.get('notificationGroup');
    const enrollmentRequest: EnrollmentRequest = {
      studentIds: [student.id],
      testId: this.testId,
      sendNotification: notificationGroup?.get('sendNotification')?.value,
      notificationMessage: notificationGroup?.get('notificationMessage')?.value
    };

    this.enrollmentService.enrollStudents(enrollmentRequest).subscribe({
      next: (response: any) => {
        student.enrolled = true;
        this.enrolledStudents.push(student);
        this.availableStudents = this.availableStudents.filter(s => s.id !== student.id);
        this.selectedStudents.delete(student.id);
        this.isSubmitting = false;
        this.successMessage = `Enrolled ${student.name} successfully!`;
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        this.errorMessage = `Failed to enroll ${student.name}`;
        this.isSubmitting = false;
        console.error('Error enrolling student:', error);
        this.clearMessagesAfterDelay();
      }
    });
  }

  unenrollStudent(student: Student): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.enrollmentService.unenrollStudent(this.testId, student.id).subscribe({
      next: () => {
        student.enrolled = false;
        this.enrolledStudents = this.enrolledStudents.filter(s => s.id !== student.id);
        this.availableStudents.push(student);
        this.isSubmitting = false;
        this.successMessage = `Unenrolled ${student.name} successfully!`;
        this.filterStudents();
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        this.errorMessage = `Failed to unenroll ${student.name}`;
        this.isSubmitting = false;
        console.error('Error unenrolling student:', error);
        this.clearMessagesAfterDelay();
      }
    });
  }

  // Bulk Operations
  toggleStudentSelection(studentId: number): void {
    if (this.selectedStudents.has(studentId)) {
      this.selectedStudents.delete(studentId);
    } else {
      this.selectedStudents.add(studentId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.availableStudents.forEach(student => {
        this.selectedStudents.add(student.id);
      });
    } else {
      this.selectedStudents.clear();
    }
    this.updateSelectAllState();
  }

  updateSelectAllState(): void {
    this.selectAll = this.availableStudents.length > 0 && 
      this.selectedStudents.size === this.availableStudents.length;
  }

  enrollSelectedStudents(): void {
    if (this.selectedStudents.size === 0) {
      this.errorMessage = 'Please select at least one student to enroll';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const selectedCount = this.selectedStudents.size;
    const notificationGroup = this.enrollmentForm.get('notificationGroup');

    const enrollmentRequest: EnrollmentRequest = {
      studentIds: Array.from(this.selectedStudents),
      testId: this.testId,
      sendNotification: notificationGroup?.get('sendNotification')?.value,
      notificationMessage: notificationGroup?.get('notificationMessage')?.value
    };

    this.enrollmentService.enrollStudents(enrollmentRequest).subscribe({
      next: (response: any) => {
        this.availableStudents.forEach(student => {
          if (this.selectedStudents.has(student.id)) {
            student.enrolled = true;
            this.enrolledStudents.push(student);
          }
        });

        this.availableStudents = this.availableStudents.filter(student => !this.selectedStudents.has(student.id));
        this.selectedStudents.clear();
        this.selectAll = false;
        this.isSubmitting = false;
        this.successMessage = `Successfully enrolled ${selectedCount} student(s)!`;
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        this.errorMessage = 'Failed to enroll selected students';
        this.isSubmitting = false;
        console.error('Error enrolling students:', error);
        this.clearMessagesAfterDelay();
      }
    });
  }

  // Bulk Unenroll
  unenrollAllStudents(): void {
    if (this.enrolledStudents.length === 0) {
      this.errorMessage = 'No students to unenroll';
      return;
    }

    if (confirm(`Are you sure you want to unenroll all ${this.enrolledStudents.length} students?`)) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.enrollmentService.unenrollAllStudents(this.testId).subscribe({
        next: () => {
          this.enrolledStudents.forEach(student => {
            student.enrolled = false;
            this.availableStudents.push(student);
          });
          this.enrolledStudents = [];
          this.isSubmitting = false;
          this.successMessage = `Unenrolled all students successfully!`;
          this.filterStudents();
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          this.errorMessage = 'Failed to unenroll all students';
          this.isSubmitting = false;
          console.error('Error unenrolling all students:', error);
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  // Import/Export
  exportEnrollments(): void {
    const enrollmentsData = {
      test: this.test,
      enrolledStudents: this.enrolledStudents,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(enrollmentsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `enrollments-test-${this.testId}.json`;
    link.click();
    
    this.successMessage = 'Enrollments exported successfully!';
    this.clearMessagesAfterDelay();
  }

  // Send notifications
  sendNotifications(): void {
    if (this.enrolledStudents.length === 0) {
      this.errorMessage = 'No enrolled students to notify';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const notificationGroup = this.enrollmentForm.get('notificationGroup');
    const message = notificationGroup?.get('notificationMessage')?.value;

    this.enrollmentService.sendNotifications(this.testId, message).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = `Notifications sent to ${this.enrolledStudents.length} students!`;
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        this.errorMessage = 'Failed to send notifications';
        this.isSubmitting = false;
        console.error('Error sending notifications:', error);
        this.clearMessagesAfterDelay();
      }
    });
  }

  // Navigation
  onBack(): void {
    this.router.navigate(['/examiner/tests']);
  }

  // Utility methods
  get enrolledCount(): number {
    return this.enrolledStudents.length;
  }

  get availableCount(): number {
    return this.availableStudents.length;
  }

  get selectedCount(): number {
    return this.selectedStudents.size;
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000);
  }

  getDepartmentClass(dept: string): string {
    // Return different classes for different departments for visual variety
    const departmentClasses: {[key: string]: string} = {
      'Engineering': 'engineering',
      'Science': 'science',
      'Mathematics': 'primary',
      'Arts': 'warning',
      'Business': 'info'
    };
    
    return departmentClasses[dept] || 'primary';
  }

  getDepartmentCount(dept: string): number {
    return this.allStudents.filter(student => student.department === dept).length;
  }
}