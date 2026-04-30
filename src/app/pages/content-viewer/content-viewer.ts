import {
  Component,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-content-viewer',
  imports: [],
  templateUrl: './content-viewer.html',
  styleUrl: './content-viewer.scss',
})
export class ContentViewer {
  @Input() file: { url: string; type: string } = {
    url: '',
    type: '',
  };
  @Output() close = new EventEmitter<void>();
  @Output() contentScroll = new EventEmitter<string>();

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.close.emit();
  }
}
