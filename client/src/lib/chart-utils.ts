import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Color palette based on design system
export const colors = {
  primary: 'hsl(203.8863, 88.2845%, 53.1373%)', // #1976D2
  secondary: 'hsl(122.3953, 42.8571%, 44.7059%)', // #388E3C
  accent: 'hsl(30.7692, 100%, 50%)', // #F57C00
  error: 'hsl(3.5714, 77.2727%, 53.7255%)', // #D32F2F
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  gray: {
    100: '#F5F5F5',
    300: '#E0E0E0',
    500: '#9E9E9E',
    700: '#616161',
    900: '#212121'
  }
};

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: colors.primary,
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
    }
  }
};

export const lineChartDefaults = {
  ...chartDefaults,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        }
      }
    },
    y: {
      grid: {
        color: colors.gray[300],
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 11,
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2,
      backgroundColor: '#fff',
    }
  }
};

export const barChartDefaults = {
  ...chartDefaults,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        }
      }
    },
    y: {
      grid: {
        color: colors.gray[300],
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 11,
        }
      },
      beginAtZero: true,
    }
  },
  elements: {
    bar: {
      borderRadius: 4,
      borderSkipped: false,
    }
  }
};

export const doughnutChartDefaults = {
  ...chartDefaults,
  cutout: '60%',
  elements: {
    arc: {
      borderWidth: 0,
    }
  }
};

// Helper functions for creating chart data
export function createCGPATrendData(data: any[]) {
  return {
    labels: data.map(item => item.semester),
    datasets: [
      {
        label: 'Computer Science',
        data: data.map(item => item.cs),
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
        fill: false,
      },
      {
        label: 'Software Engineering',
        data: data.map(item => item.se),
        borderColor: colors.secondary,
        backgroundColor: colors.secondary + '20',
        fill: false,
      }
    ]
  };
}

export function createGradeDistributionData(grades: Record<string, number>) {
  return {
    labels: Object.keys(grades),
    datasets: [{
      data: Object.values(grades),
      backgroundColor: [
        colors.secondary,
        '#4CAF50',
        '#8BC34A',
        colors.accent,
        '#FF9800',
        '#FF5722',
        '#F44336',
        colors.error
      ],
      borderWidth: 0,
    }]
  };
}

export function createPassFailData(modules: any[]) {
  return {
    labels: modules.map(m => m.code),
    datasets: [
      {
        label: 'Pass Rate (%)',
        data: modules.map(m => m.passRate),
        backgroundColor: colors.secondary,
      },
      {
        label: 'Fail Rate (%)',
        data: modules.map(m => m.failRate),
        backgroundColor: colors.error,
      }
    ]
  };
}

// Format percentage for charts
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Format CGPA for charts
export function formatCGPA(value: number): string {
  return value.toFixed(2);
}

// Get color based on performance level
export function getPerformanceColor(cgpa: number): string {
  if (cgpa >= 3.75) return colors.secondary; // Dean's List
  if (cgpa >= 3.0) return colors.primary;    // Good
  if (cgpa >= 2.5) return colors.accent;     // Average
  if (cgpa >= 2.0) return colors.warning;    // Below Average
  return colors.error;                        // Probation
}

// Create semester labels
export function createSemesterLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Sem ${i + 1}`);
}
