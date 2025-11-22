import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cbt-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  form: FormGroup;
  token = '';
  submitted = false;
  loading = false;
  message = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    
    // Check if token is present
    if (!this.token) {
      this.error = 'Invalid or missing reset token. Please request a new password reset link.';
    }
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    this.submitted = true;
    this.message = '';
    this.error = '';

    if (this.form.invalid || !this.token) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.authService.resetPassword(this.token, this.form.value.password)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.message = 'Password successfully reset! You can now sign in with your new password.';
          this.form.reset();
          this.submitted = false;
          
          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Password reset failed. The link may have expired. Please request a new reset link.';
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

  hasFormError(errorKey: string): boolean {
    return !!(this.form.errors && this.form.errors[errorKey] && this.submitted);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors?.['required']) {
      return 'This field is required';
    }
    if (field?.errors?.['minlength']) {
      return `Password must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    return '';
  }

  getPasswordStrengthText(): string {
    const password = this.form.get('password')?.value;
    if (!password) return '';
    
    if (password.length < 8) return 'Weak';
    if (password.length < 12) return 'Good';
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return 'Strong';
    }
    return 'Good';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrengthText().toLowerCase();
    return `password-strength-${strength}`;
  }
}