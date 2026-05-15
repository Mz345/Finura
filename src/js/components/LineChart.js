// src/js/components/LineChart.js

const Chart = window.Chart;

class LineChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = {};
    this.chartInstance = null;
  }

  connectedCallback() {
    const title = this.getAttribute('chart-title') || 'Chart';
    const subtitle = this.getAttribute('chart-subtitle') || 'Chart data description';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          /* Make the component fill its parent */
          height: 100%; 
        }
        .chart-card {
          background-color: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0px 8px 24px rgba(17, 24, 39, 0.05);
          border: 1px solid #E5E7EB;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          height: 100%;
          box-sizing: border-box; 
          display: flex;
          flex-direction: column;
        }
        .chart-header h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #111827;
        }
        .chart-header p {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }
        .chart-body {
          margin-top: 20px;
          position: relative;
          flex-grow: 1;
        }
        .no-data-message {
            text-align: center;
            color: #6B7280;
            padding-top: 50px;
        }
      </style>

      <div class="chart-card">
        <div class="chart-header">
          <h3>${title}</h3>
          <p>${subtitle}</p>
        </div>
        <div class="chart-body">
          </div>
      </div>
    `;
  }

  set data(value) {
    // --- THIS FIXES THE FLAT LINE ---
    
    // Check if data is missing or labels array is empty
    const isDataInvalid = !value || !value.labels || !value.amounts || value.labels.length === 0;
    
    // Check if data IS valid, but all amounts are 0
    const isAllZero = !isDataInvalid && value.amounts.every(amount => amount === 0);

    // If either condition is true, show the "no data" message
    if (isDataInvalid || isAllZero) {
      this.displayNoDataMessage();
      return;
    }
    // --- END OF FIX ---
    
    this._data = value;
    this.renderChart();
  }

  get data() {
    return this._data;
  }

  renderChart() {
    const chartBody = this.shadowRoot.querySelector('.chart-body');
    chartBody.innerHTML = `<canvas id="chart"></canvas>`; // Add canvas
    const ctx = this.shadowRoot.querySelector('#chart');

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this._data.labels,
        datasets: [
          {
            label: 'Expenses',
            data: this._data.amounts,
            borderColor: '#EF4444',
            backgroundColor: 'transparent',
            tension: 0.3, 
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#EF4444',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                let value = context.raw;
                // Using ₹ for currency
                return `${label}: ₹${value.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawDash: [5, 5],
              color: '#E5E7EB'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  displayNoDataMessage() {
    const chartBody = this.shadowRoot.querySelector('.chart-body');
    chartBody.innerHTML = `<p class="no-data-message">No expense data available for this period.</p>`;
  }
}

customElements.define('line-chart', LineChart);