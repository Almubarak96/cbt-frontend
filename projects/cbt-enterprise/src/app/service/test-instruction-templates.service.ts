/* // services/instruction-templates.service.ts
import { Injectable } from '@angular/core';
import { InstructionTemplate } from '../models/test-instructions.dto';

@Injectable({
  providedIn: 'root'
})
export class InstructionTemplatesService {

  private templates: InstructionTemplate[] = [
    {
      id: 1,
      name: 'Standard Exam',
      description: 'General purpose exam instructions',
      instructions: [
        'This exam consists of multiple-choice questions. You must answer all questions.',
        'You have {duration} minutes to complete the exam.',
        'The exam contains {totalQuestions} questions.',
        'Passing score is {passingScore}%.',
        'Questions will be presented in {questionOrder}.',
        'Answer choices will be {choiceOrder}.',
        'Do not refresh the page during the exam.',
        'Ensure you have a stable internet connection.',
        'Any attempt to cheat will result in immediate disqualification.'
      ]
    },
    {
      id: 2,
      name: 'Timed Assessment',
      description: 'For time-sensitive assessments',
      instructions: [
        'This is a timed assessment with strict time limits.',
        'You have exactly {duration} minutes to complete all {totalQuestions} questions.',
        'The timer will start as soon as you begin the exam.',
        'Once time expires, the exam will auto-submit.',
        'Passing score is {passingScore}%.',
        'No backtracking - you cannot return to previous questions.',
        'Ensure you are in a quiet environment with no interruptions.'
      ]
    },
    {
      id: 3,
      name: 'Open Book',
      description: 'For open book exams with resource access',
      instructions: [
        'This is an open book exam - you may use reference materials.',
        'You have {duration} minutes to complete {totalQuestions} questions.',
        'While you may use resources, all work must be your own.',
        'Collaboration with others is strictly prohibited.',
        'Internet research is permitted but cite your sources if required.',
        'Passing score is {passingScore}%.',
        'Ensure you manage your time effectively with available resources.'
      ]
    },
    {
      id: 4,
      name: 'Professional Certification',
      description: 'For professional certification exams',
      instructions: [
        'This professional certification exam must be completed independently.',
        'Duration: {duration} minutes for {totalQuestions} questions.',
        'Minimum passing score: {passingScore}%.',
        'No external help or resources permitted.',
        'Webcam monitoring is active throughout the exam.',
        'Any suspicious activity will be flagged for review.',
        'Certification may be revoked for violation of rules.'
      ]
    }
  ];

  getTemplates(): InstructionTemplate[] {
    return this.templates;
  }

  getTemplate(id: number): InstructionTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  applyTemplate(template: InstructionTemplate, testConfig: any): string[] {
    return template.instructions.map(instruction => {
      return instruction
        .replace('{duration}', testConfig.durationMinutes)
        .replace('{totalQuestions}', testConfig.totalQuestions)
        .replace('{passingScore}', testConfig.passingScore || 70)
        .replace('{questionOrder}', testConfig.shuffleQuestions ? 'random order' : 'sequential order')
        .replace('{choiceOrder}', testConfig.shuffleChoices ? 'randomized' : 'fixed order');
    });
  }
} */