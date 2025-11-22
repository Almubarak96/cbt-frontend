import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../../service/confing.service';

@Component({
  selector: 'app-app-config',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './app-config.html',
  styleUrl: './app-config.scss'
})
export class AppConfig {
  configForm!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private configService: ConfigService) { }

  ngOnInit(): void {
    this.configForm = this.fb.group({
      // =========================
      // Application Info
      // =========================
      'spring.application.name': [''],

      // =========================
      // Database
      // =========================
      'spring.datasource.url': [''],
      'spring.datasource.username': [''],
      'spring.datasource.password': [''],

      // =========================
      // JWT Security
      // =========================
      'jwt.secret': [''],
      'jwt.expirationMs': [''],
      'jwt.access-exp-sec': [''],

      // =========================
      // Redis Cache
      // =========================
      'spring.redis.host': [''],
      'spring.redis.port': [''],

      // =========================
      // Email SMTP
      // =========================
      'spring.mail.host': [''],
      'spring.mail.port': [''],
      'spring.mail.username': [''],
      'spring.mail.password': [''],
      'app.mail.from': [''],

      // =========================
      // Template Directory
      // =========================
      'cbt.templates.dir': [''],

      // =========================
      // Storage Type
      // =========================
      'proctor.storage.type': [''],

      // AWS S3
      'aws.s3.bucket-name': [''],
      'aws.s3.region': [''],
      'aws.s3.access-key': [''],
      'aws.s3.secret-key': [''],

      // Azure Blob
      'azure.blob.container': [''],
      'azure.blob.connection-string': [''],

      // GCP Storage
      'gcp.storage.bucket': [''],
      'gcp.storage.credentials-file': [''],

      // =========================
      // Logging
      // =========================
      'logging.level.org.springframework': [''],
      'logging.level.com.almubaraksuleiman.cbts': ['']
    });

    this.configService.getConfigs().subscribe(data => {
      this.configForm.patchValue(data);
      this.loading = false;
    });
  }

  onSave(): void {
    this.configService.saveConfigs(this.configForm.value).subscribe(() => {
      alert('Configurations saved successfully');
    });
  }
}
