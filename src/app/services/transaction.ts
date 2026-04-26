import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: number;
  category: string;
  date: string;
}

export interface CreateTransaction {
  description: string;
  amount: number;
  type: number;
  category: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/Transactions`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  create(transaction: CreateTransaction): Observable<any> {
    return this.http.post(this.apiUrl, transaction);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}