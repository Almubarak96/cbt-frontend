import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';




interface EmailVariableModel {
  key: string;
  value: string;
  description?: string;
}

@Component({
  selector: 'app-email-varaibles',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './email-varaibles.html',
  styleUrl: './email-varaibles.scss'
})
export class EmailVaraibles {


  variables: EmailVariableModel[] = [];
  form: FormGroup;
  editing: EmailVariableModel | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadVariables();
  }

  loadVariables(): void {
    this.http.get<EmailVariableModel[]>('http://localhost:8080/api/admin/email-variables')
      .subscribe(data => this.variables = data);
  }

  edit(variable: EmailVariableModel) {
    this.editing = variable;
    this.form.patchValue(variable);
  }

  save() {
    if (this.form.invalid) return;

    const payload = this.form.value;
    if (this.editing) {
      this.http.put(`http://localhost:8080/api/admin/email-variables/${this.editing.key}`, payload)
        .subscribe(() => {
          this.editing = null;
          this.form.reset();
          this.loadVariables();
        });
    } else {
      this.http.post('http://localhost:8080/api/admin/email-variables', payload)
        .subscribe(() => {
          this.form.reset();
          this.loadVariables();
        });
    }
  }

  cancel() {
    this.editing = null;
    this.form.reset();
  }

}
