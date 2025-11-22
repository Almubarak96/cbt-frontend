import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExaminerService } from '../../../service/exaimner.service';
import {FormsModule} from '@angular/forms'

@Component({
  selector: 'app-assign-test',
  imports: [FormsModule],
  templateUrl: './assign-test.html',
  styleUrl: './assign-test.scss'
})
export class AssignTest {

  testId!: number;
  studentId!: number;
  groupId!: number;

  constructor(private route: ActivatedRoute, private examinerService: ExaminerService) {}

  ngOnInit() {
    this.testId = Number(this.route.snapshot.paramMap.get('testId'));
  }

  assignToStudent() {
    this.examinerService.assignToStudent(this.testId, this.studentId).subscribe(() => alert('Assigned to Student!'));
  }

  assignToGroup() {
    this.examinerService.assignToGroup(this.testId, this.groupId).subscribe(() => alert('Assigned to Group!'));
  }

}
