import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { TransactionService, Transaction, CreateTransaction } from '../../services/transaction';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  loading = false;
  showForm = false;

  newTransaction: CreateTransaction = {
    description: '',
    amount: 0,
    type: 2,
    category: '',
    userId: ''
  };

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.newTransaction.userId = this.authService.getUserId();
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get totalIncome() {
    return this.transactions
      .filter(t => t.type === 1)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get totalExpense() {
    return this.transactions
      .filter(t => t.type === 2)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  get balance() {
    return this.totalIncome - this.totalExpense;
  }

  onSubmit() {
  const transaction = {
    ...this.newTransaction,
    type: Number(this.newTransaction.type)
  };
  this.transactionService.create(transaction).subscribe({
    next: () => {
      this.loadTransactions();
      this.showForm = false;
      this.newTransaction = { 
        description: '', 
        amount: 0, 
        type: 2, 
        category: '', 
        userId: this.authService.getUserId() 
      };
    }
  });

}
  delete(id: string) {
    this.transactionService.delete(id).subscribe({
      next: () => this.loadTransactions()
    });
  }

  logout() {
    this.authService.logout();
  }
}