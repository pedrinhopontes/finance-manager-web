import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService, Transaction } from '../../services/transaction';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef;

  transactions: Transaction[] = [];
  categoryChart: any;
  monthlyChart: any;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionService.getAll().subscribe({
      next: (data) => {
        this.transactions = data;
        this.buildCharts();
      }
    });
  }

  ngAfterViewInit() {}

  buildCharts() {
    setTimeout(() => {
      this.buildCategoryChart();
      this.buildMonthlyChart();
    }, 100);
  }

  get totalIncome() {
    return this.transactions.filter(t => t.type === 1).reduce((s, t) => s + t.amount, 0);
  }

  get totalExpense() {
    return this.transactions.filter(t => t.type === 2).reduce((s, t) => s + t.amount, 0);
  }

  get balance() {
    return this.totalIncome - this.totalExpense;
  }

  buildCategoryChart() {
    const expenses = this.transactions.filter(t => t.type === 2);
    const categoryMap: { [key: string]: number } = {};

    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);
    const colors = ['#6366f1','#10b981','#ef4444','#f59e0b','#3b82f6','#ec4899','#8b5cf6','#14b8a6'];

    if (this.categoryChart) this.categoryChart.destroy();

    this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } }
        }
      }
    });
  }

  buildMonthlyChart() {
    const monthlyMap: { [key: string]: { income: number, expense: number } } = {};

    this.transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
      if (t.type === 1) monthlyMap[month].income += t.amount;
      else monthlyMap[month].expense += t.amount;
    });

    const labels = Object.keys(monthlyMap);
    const incomes = labels.map(l => monthlyMap[l].income);
    const expenses = labels.map(l => monthlyMap[l].expense);

    if (this.monthlyChart) this.monthlyChart.destroy();

    this.monthlyChart = new Chart(this.monthlyChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Receitas', data: incomes, backgroundColor: '#10b981', borderRadius: 6 },
          { label: 'Despesas', data: expenses, backgroundColor: '#ef4444', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 12 } } },
          x: { grid: { display: false }, ticks: { font: { size: 12 } } }
        }
      }
    });
  }

  getCategoryExpenses() {
    const expenses = this.transactions.filter(t => t.type === 2);
    const categoryMap: { [key: string]: number } = {};
    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount, percent: (amount / this.totalExpense) * 100 }))
      .sort((a, b) => b.amount - a.amount);
  }
}