import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';





interface EmailTemplateModel {
  id: number;
  name: string;
  subject: string;
  body: string;
}

@Component({
  selector: 'email-template',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './email-template.html',
  styleUrl: './email-template.scss'
})
export class EmailTemplate {

    templates: EmailTemplateModel[] = [];
  form: FormGroup;
  editing: EmailTemplateModel | null = null;
  previewContent: SafeHtml | null = null; // live preview

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.http.get<EmailTemplateModel[]>('http://localhost:8080/api/admin/email-templates')
      .subscribe(data => this.templates = data);
  }

  edit(template: EmailTemplateModel) {
    this.editing = template;
    this.form.patchValue(template);
    this.previewContent = null;
  }

  save() {
    if (this.form.invalid) return;

    const payload = this.form.value;
    if (this.editing) {
      this.http.put(`http://localhost:8080/api/admin/email-templates/${this.editing.id}`, payload)
        .subscribe(() => {
          this.editing = null;
          this.form.reset();
          this.loadTemplates();
          this.previewContent = null;
        });
    } else {
      this.http.post('http://localhost:8080/api/admin/email-templates', payload)
        .subscribe(() => {
          this.form.reset();
          this.loadTemplates();
          this.previewContent = null;
        });
    }
  }

  cancel() {
    this.editing = null;
    this.form.reset();
    this.previewContent = null;
  }

  /**
   * Generate live preview of email
   * Here we can replace some example variables dynamically
   */
  preview() {
    const templateBody = this.form.get('body')?.value || '';
    const exampleVars: Record<string, string> = {
      username: 'John Doe',
      verifyLink: 'http://localhost:4200/api/auth/verify?token=12345',
      resetLink: 'https://example.com/reset-password?token=12345',
      expiryMinutes: '30',
      supportEmail: 'support@example.com'
    };

    let previewHtml = templateBody;
    for (const key in exampleVars) {
      const regex = new RegExp(`\\[\\[\\$\\{${key}\\}\\]\\]`, 'g');
      previewHtml = previewHtml.replace(regex, exampleVars[key]);
    }

    this.previewContent = this.sanitizer.bypassSecurityTrustHtml(previewHtml);
  }

}
