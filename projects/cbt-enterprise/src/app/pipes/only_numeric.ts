import { Directive, HostListener } from "@angular/core";

/***This pipe enforce only number is type in an input field */

@Directive({
  selector: '[appOnlyNumeric]',
  standalone: true // Make directive standalone!
})
export class OnlyNumericDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
    ];
    // Allow: Ctrl/cmd+A,C,V,X
    if (
      allowedKeys.indexOf(event.key) !== -1 ||
      (event.ctrlKey || event.metaKey)
    ) {
      return;
    }
    const input = (event.target as HTMLInputElement);
    // Allow numbers and "+" only at the start if not already present
    if (
      (event.key === '+' && input.selectionStart === 0 && !input.value.includes('+')) ||
      (event.key >= '0' && event.key <= '9')
    ) {
      return;
    }
    event.preventDefault();
  }
}