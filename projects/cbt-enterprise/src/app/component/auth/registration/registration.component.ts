// import { CommonModule } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { AuthService, RegisterPayload } from '../../../service/auth.service';

// @Component({
//   selector: 'cbt-registration',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './registration.component.html',
//   styleUrl: './registration.component.scss'
// })
// export class RegistrationComponent {

//   form: FormGroup;
//   submitted = false;
//   message = '';
//   error = '';

//   roles = [
//     { label: 'Student', value: 'student' },
//     { label: 'Admin', value: 'admin' },
//     { label: 'Examiner', value: 'examiner' },
//     { label: 'Proctor', value: 'proctor' }
//   ];

//   constructor(private fb: FormBuilder, private authService: AuthService) {
//     this.form = this.fb.group({
//       email: ['', [Validators.required]],
//       username: ['', [Validators.required, Validators.minLength(3)]],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       confirmPassword: ['', Validators.required],
//       role: ['', Validators.required]
//     }, { validator: this.passwordMatch });
//   }

//   get f() { return this.form.controls; }

//   passwordMatch(group: FormGroup) {
//     return group.get('password')!.value === group.get('confirmPassword')!.value
//       ? null : { mismatch: true };
//   }

//   onSubmit() {
//     this.submitted = true;
//     this.message = '';
//     this.error = '';

//     if (this.form.invalid) return;

//     const payload: RegisterPayload = {
//       email: this.f['email'].value,
//       username: this.f['username'].value,
//       password: this.f['password'].value,
//       role: this.f['role'].value
//     };

//     // Call AuthService instead of HTTP directly
//     this.authService.register(payload).subscribe({
//       next: res => this.message = res.message || 'Registered successfully!',
//       error: err => this.error = err.error?.error || 'Registration failed'
//     });
//   }

// }


import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterPayload } from '../../../service/auth.service';

@Component({
  selector: 'cbt-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  form: FormGroup;
  submitted = false;
  loading = false;
  message = '';
  error = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  roles = [
    { label: 'Student', value: 'ROLE_STUDENT' },
    { label: 'Administrator', value: 'ROLE_ADMIN' },
    { label: 'Examiner', value: 'ROLE_EXAMINER' },
    { label: 'Proctor', value: 'ROLE_PROCTOR' }
  ];

  departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Engineering',
    'Business Administration',
    'Economics',
    'Psychology',
    'Other'
  ];

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      
      // Account Information
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      
      // Additional Information
      role: ['', Validators.required],
      department: ['', Validators.required],
      
      // Profile Image
      profileImage: ['']
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { mismatch: true };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.error = 'Please select a valid image file (JPEG, PNG, GIF)';
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.error = 'Image size should be less than 2MB';
        return;
      }

      this.selectedFile = file;
      this.form.patchValue({ profileImage: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      this.error = '';
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.form.patchValue({ profileImage: '' });
  }

  onSubmit() {
    this.submitted = true;
    this.message = '';
    this.error = '';

    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('firstName', this.form.value.firstName);
    formData.append('lastName', this.form.value.lastName);
    formData.append('email', this.form.value.email);
    formData.append('username', this.form.value.username);
    formData.append('password', this.form.value.password);
    formData.append('role', this.form.value.role);
    formData.append('department', this.form.value.department);
    
    if (this.form.value.middleName) {
      formData.append('middleName', this.form.value.middleName);
    }
    
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = res.message || 'Registration successful! Redirecting to login...';
        this.form.reset();
        this.submitted = false;
        this.selectedFile = null;
        this.imagePreview = null;
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || err.error?.message || 'Registration failed. Please try again.';
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
    if (field?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    if (field?.errors?.['minlength']) {
      return `Minimum ${field.errors?.['minlength'].requiredLength} characters required`;
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
