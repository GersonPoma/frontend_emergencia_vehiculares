import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getWithPagination<T>(
    url: string,
    pagina: number = 1,
    limite: number = 10,
    filters?: Record<string, any>
  ): Observable<Pagination<T>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] != null && filters[key] !== '') {
          params = params.set(key, String(filters[key]));
        }
      });
    }

    return this.http.get<Pagination<T>>(url, { params });
  }

  getAll<T>(url: string, filters?: Record<string, any>): Observable<T[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] != null && filters[key] !== '') {
          params = params.set(key, String(filters[key]));
        }
      });
    }

    return this.http.get<T[]>(url, { params });
  }

  getById<T>(url: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${url}/${id}`);
  }

  create<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(url, data);
  }

  update<T>(url: string, id: number | string, data: any): Observable<T> {
    return this.http.put<T>(`${url}/${id}`, data);
  }

  patch<T>(url: string, id: number | string, data: any): Observable<T> {
    return this.http.patch<T>(`${url}/${id}`, data);
  }

  delete<T>(url: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${url}/${id}`);
  }
}
