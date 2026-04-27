import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  template: `
    <div class="branding-container">
      <span class="app-name">AutoSOS</span>
    </div>
  `,
  styles: [`
    .branding-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      margin: 12px;
    }

    .app-name {
      font-weight: 700;
      font-size: 18px;
      color: white;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      letter-spacing: 0.5px;
    }
  `]
})
export class BrandingComponent {
  options = this.settings.getOptions();

  constructor(private settings: CoreService) {}
}
