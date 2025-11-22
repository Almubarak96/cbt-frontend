import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to convert a JSON string of choices (e.g., '["A","B","C"]') to an array.
 * If the string is not valid JSON, returns the original string in a single-element array.
 */
@Pipe({ name: 'jsonToChoices' })
export class JsonToChoicesPipe implements PipeTransform {
  transform(value: string): string[] {
    if (!value) return [];
    try {
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) {
        return arr;
      }
    } catch {
      // Not JSON, assume comma-separated
      if (value.includes(',')) {
        return value.split(',').map(s => s.trim());
      }
    }
    return [value];
  }
}