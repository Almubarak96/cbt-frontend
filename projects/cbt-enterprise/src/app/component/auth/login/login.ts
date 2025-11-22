import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'cbt-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    this.auth.login({ 
      username: this.form.value.username, 
      password: this.form.value.password 
    }).subscribe({
      next: () => {
        this.loading = false;
        this.auth.getRole$().subscribe(role => {
          // Handle null/undefined role safely
          const routeMap: { [key: string]: string } = {
            'ROLE_ADMIN': '/admin',
            'ROLE_EXAMINER': '/examiner',
            'ROLE_PROCTOR': '/proctor',
            'ROLE_STUDENT': '/student/test-selection'
          };
          
          // Safe navigation with null check
          const route = role ? routeMap[role] : null;
          this.router.navigate([route || '/']);
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid credentials. Please try again.';
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors?.['required']) {
      return 'This field is required';
    }
    if (field?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    if (field?.errors?.['minlength']) {
      return `Password must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    return '';
  }
}