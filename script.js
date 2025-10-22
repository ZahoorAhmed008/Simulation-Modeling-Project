

// --- Parameters for demand model (fixed) ---
const demandModel = [
  { type: "Peak", demand: 40, prob: 0.25 },
  { type: "Normal", demand: 30, prob: 0.50 },
  { type: "Slow", demand: 20, prob: 0.25 }
];

// Utility: choose demand based on uniform random number r in [0,1)
function mapRandomToDemand(r) {
  if (r < demandModel[0].prob) return demandModel[0];
  if (r < demandModel[0].prob + demandModel[1].prob) return demandModel[1];
  return demandModel[2];
}

// Format money
function fm(n) {
  return "$" + n.toFixed(2);
}

// Wait for DOM to load before binding buttons
window.addEventListener("DOMContentLoaded", () => {

  const runBtn = document.getElementById("runBtn");
  const resetBtn = document.getElementById("resetBtn");
  const tableBody = document.querySelector("#resultTable tbody");

  let chart; // Chart.js instance

  runBtn.addEventListener("click", runSimulation);
  resetBtn.addEventListener("click", resetTable);

  function runSimulation() {
    const orderQty = Math.max(1, parseInt(document.getElementById("orderQty").value || 35));
    const days = Math.max(1, parseInt(document.getElementById("numDays").value || 25));

    // Reset table
    tableBody.innerHTML = "";

    // Totals
    let totals = {
      revenue: 0,
      cost: 0,
      salvage: 0,
      lost: 0,
      profit: 0
    };

    const profitSeries = [];
    const labels = [];

    for (let day = 1; day <= days; day++) {
      const r = Math.random();
      const model = mapRandomToDemand(r);
      const demand = model.demand;

      const sold = Math.min(orderQty, demand);
      const unsold = Math.max(0, orderQty - demand);
      const excessDemand = Math.max(0, demand - orderQty);

      const revenue = sold * 15;
      const cost = orderQty * 8;
      const salvage = unsold * 3;
      const lostProfit = excessDemand * 7;
      const dailyProfit = revenue + salvage - cost - lostProfit;

      totals.revenue += revenue;
      totals.cost += cost;
      totals.salvage += salvage;
      totals.lost += lostProfit;
      totals.profit += dailyProfit;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${day}</td>
        <td>${r.toFixed(3)}</td>
        <td>${model.type}</td>
        <td>${demand}</td>
        <td>${sold}</td>
        <td>${fm(revenue)}</td>
        <td>${fm(cost)}</td>
        <td>${fm(salvage)}</td>
        <td>${fm(lostProfit)}</td>
        <td><strong>${fm(dailyProfit)}</strong></td>
      `;
      tableBody.appendChild(tr);

      labels.push("Day " + day);
      profitSeries.push(Number(dailyProfit.toFixed(2)));
    }

    document.getElementById("totalRevenue").innerText = fm(totals.revenue);
    document.getElementById("totalCost").innerText = fm(totals.cost);
    document.getElementById("totalSalvage").innerText = fm(totals.salvage);
    document.getElementById("totalLost").innerText = fm(totals.lost);
    document.getElementById("totalProfit").innerText = fm(totals.profit);

    renderChart(labels, profitSeries);
  }

  function renderChart(labels, series) {
    const ctx = document.getElementById("profitChart").getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Profit ($)",
            data: series,
            borderRadius: 6,
            barPercentage: 0.7,
            backgroundColor: "#5c7cfa"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { maxRotation: 0, minRotation: 0 } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (v) { return "$" + v; }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) { return "Profit: $" + Number(ctx.raw).toFixed(2); }
            }
          }
        }
      }
    });
  }

  function resetTable() {
    // Clear table
    tableBody.innerHTML = "";

    // Reset totals
    document.getElementById("totalRevenue").innerText = "$0.00";
    document.getElementById("totalCost").innerText = "$0.00";
    document.getElementById("totalSalvage").innerText = "$0.00";
    document.getElementById("totalLost").innerText = "$0.00";
    document.getElementById("totalProfit").innerText = "$0.00";

    // Destroy chart if exists
    if (chart) {
      chart.destroy();
      chart = null;
    }

    console.log("✅ Table and chart have been reset.");
  }

});
