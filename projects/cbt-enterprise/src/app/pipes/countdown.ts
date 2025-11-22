import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countdown',
  standalone: true
})
export class CountdownPipe implements PipeTransform {
  transform(value: number): string {
    if (!value || value < 0) value = 0;

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    if (hours > 0) {
      // Show hh:mm:ss if hours exist
      return `${hours.toString().padStart(2, '0')}:` +
             `${minutes.toString().padStart(2, '0')}:` +
             `${seconds.toString().padStart(2, '0')}`;
    } else {
      // Show mm:ss if less than 1 hour
      return `${minutes.toString().padStart(2, '0')}:` +
             `${seconds.toString().padStart(2, '0')}`;
    }
  }
}
