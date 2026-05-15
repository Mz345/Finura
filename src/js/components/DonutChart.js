const Chart = window.Chart;

class DoughnutChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = {};
    this.chartInstance = null;
  }

  connectedCallback() {
    const title = this.getAttribute('chart-title') || 'Chart';
    const subtitle =
      this.getAttribute('chart-subtitle') ||
      'Chart data description';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }

        .chart-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0px 8px 24px rgba(17, 24, 39, 0.05);
          border: 1px solid #E5E7EB;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          height: 100%;
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
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
          flex-grow: 1;
        }

        .chart-container {
          position: relative;
          width: 240px;
          height: 240px;
          margin: auto;
        }

        canvas {
          width: 100% !important;
          height: 100% !important;
        }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
          min-width: 180px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .legend-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .legend-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-value {
          font-weight: 600;
          color: #111827;
        }

        .no-data-message {
          text-align: center;
          color: #6B7280;
          width: 100%;
          padding: 40px 0;
          font-size: 15px;
        }

        @media (max-width: 768px) {
          .chart-body {
            flex-direction: column;
            align-items: center;
          }

          .chart-legend {
            width: 100%;
          }
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
    if (
      !value ||
      !value.labels ||
      !value.amounts ||
      value.labels.length === 0
    ) {
      this.displayNoDataMessage();
      return;
    }

    this._data = value;
    this.renderChart();
  }

  get data() {
    return this._data;
  }

  renderChart() {
    const chartBody =
      this.shadowRoot.querySelector('.chart-body');

    chartBody.innerHTML = `
      <div class="chart-container">
        <canvas id="chart"></canvas>
      </div>

      <div class="chart-legend"></div>
    `;

    const ctx =
      this.shadowRoot.querySelector('#chart');

    const legendContainer =
      this.shadowRoot.querySelector('.chart-legend');

    const labels = this._data.labels;
    const amounts = this._data.amounts;

    // Modern vibrant color palette
    const colorPalette = [
      '#6366F1',
      '#8B5CF6',
      '#EC4899',
      '#F59E0B',
      '#10B981',
      '#06B6D4',
      '#EF4444',
      '#84CC16',
      '#14B8A6',
      '#F97316',
      '#3B82F6',
      '#A855F7'
    ];

    // Assign colors dynamically
    const backgroundColors = labels.map(
      (_, index) =>
        colorPalette[index % colorPalette.length]
    );

    // Create Legend
    legendContainer.innerHTML = '';

    labels.forEach((label, index) => {
      const color = backgroundColors[index];
      const amount = amounts[index];

      const legendItem = document.createElement('div');

      legendItem.className = 'legend-item';

      legendItem.innerHTML = `
        <div class="legend-left">
          <span 
            class="legend-dot"
            style="background-color:${color};"
          ></span>

          <span>${label}</span>
        </div>

        <span class="legend-value">
          ₹${amount.toLocaleString()}
        </span>
      `;

      legendContainer.appendChild(legendItem);
    });

    // Destroy old chart
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Create chart
    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',

      data: {
        labels: labels,

        datasets: [
          {
            data: amounts,

            backgroundColor: backgroundColors,

            borderColor: '#FFFFFF',

            borderWidth: 4,

            hoverOffset: 18,

            cutout: '68%'
          }
        ]
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        animation: {
          animateRotate: true,
          animateScale: true
        },

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            backgroundColor: '#111827',

            titleColor: '#FFFFFF',

            bodyColor: '#FFFFFF',

            padding: 12,

            cornerRadius: 10,

            callbacks: {
              label: function (context) {
                const label =
                  context.label || '';

                const value =
                  context.raw || 0;

                return `${label}: ₹${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  }

  displayNoDataMessage() {
    const chartBody =
      this.shadowRoot.querySelector('.chart-body');

    chartBody.innerHTML = `
      <p class="no-data-message">
        No expense data available for this month.
      </p>
    `;
  }
}

customElements.define(
  'doughnut-chart',
  DoughnutChart
);