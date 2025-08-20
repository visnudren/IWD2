import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function PerformanceDistribution() {
  const gradeDistributionData = {
    labels: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'F'],
    datasets: [{
      data: [15, 22, 28, 20, 8, 4, 2, 1],
      backgroundColor: [
        'hsl(var(--secondary))',
        '#4CAF50',
        '#8BC34A',
        'hsl(var(--accent))',
        '#FF9800',
        '#FF5722',
        '#F44336',
        'hsl(var(--error))'
      ],
      borderWidth: 0,
    }]
  };

  const passFailData = {
    labels: ['XBMC3014', 'XBMC3012', 'XBMC3015', 'XBMC2014', 'XBMC3011'],
    datasets: [
      {
        label: 'Pass Rate (%)',
        data: [95, 89, 92, 77, 88],
        backgroundColor: 'hsl(var(--secondary))',
      },
      {
        label: 'Fail Rate (%)',
        data: [5, 11, 8, 23, 12],
        backgroundColor: 'hsl(var(--error))',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">
          Performance Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Grade Distribution</h4>
            <div className="h-48">
              <Doughnut data={gradeDistributionData} options={chartOptions} />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Pass/Fail Ratios by Module</h4>
            <div className="h-48">
              <Bar data={passFailData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
