import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiBaseUrl: string = environment.apiBaseUrl;

  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  getApiUrl(endpoint: string): string {
    return `${this.apiBaseUrl}/${endpoint}`;
  }

  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }
}
