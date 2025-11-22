import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.scss'
})
export class RegisterUserComponent {

  registerUserForm: FormGroup

  constructor(private fb: FormBuilder) {

    this.registerUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['EXAMINER', Validators.required]
    });
  }



  get f() {
    return this.registerUserForm.controls;
  }

  submit() {
    if (this.registerUserForm.invalid) return;
    console.log('Admin registering:', this.registerUserForm.value);
  }


}
