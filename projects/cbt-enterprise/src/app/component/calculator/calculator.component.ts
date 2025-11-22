import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { evaluate } from 'mathjs';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class CalculatorComponent {
  display = '0';
  isScientific = false;

  // Add value to display
  addToDisplay(value: string) {
    if (this.display === '0' || this.display === 'Error') {
      this.display = value;
    } else {
      this.display += value;
    }
  }

  // Clear display
  clear() {
    this.display = '0';
  }

  // Backspace
  backspace() {
    if (this.display.length > 1) {
      this.display = this.display.slice(0, -1);
    } else {
      this.display = '0';
    }
  }

  // Calculate result
  calculate() {
    try {
      // Replace display symbols with mathjs compatible symbols
      let expression = this.display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/√/g, 'sqrt')
        .replace(/²/g, '^2')
        .replace(/³/g, '^3');
      
      const result = evaluate(expression);
      this.display = result.toString();
    } catch (error) {
      this.display = 'Error';
    }
  }

  // Scientific functions
  scientificFunction(func: string) {
    try {
      let expression = '';
      
      switch (func) {
        case 'sin': expression = `sin(${this.display})`; break;
        case 'cos': expression = `cos(${this.display})`; break;
        case 'tan': expression = `tan(${this.display})`; break;
        case 'log': expression = `log10(${this.display})`; break;
        case 'ln': expression = `log(${this.display})`; break;
        case 'sqrt': expression = `sqrt(${this.display})`; break;
        case 'square': expression = `(${this.display})^2`; break;
        case 'cube': expression = `(${this.display})^3`; break;
        case 'pi': expression = 'pi'; break;
        case 'e': expression = 'e'; break;
        case 'factorial': expression = `factorial(${this.display})`; break;
        default: return;
      }
      
      const result = evaluate(expression);
      this.display = result.toString();
    } catch (error) {
      this.display = 'Error';
    }
  }

  // Toggle scientific mode
  toggleScientific() {
    this.isScientific = !this.isScientific;
  }
}