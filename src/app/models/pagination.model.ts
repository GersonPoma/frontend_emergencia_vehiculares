export interface Pagination<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}
