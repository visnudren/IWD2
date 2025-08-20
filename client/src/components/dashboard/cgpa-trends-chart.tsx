import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function CGPATrendsChart() {
  const { data: trendsData, isLoading } = useQuery({
    queryKey: ["/api/dashboard/cgpa-trends"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CGPA Trends by Semester</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            CGPA Trends by Semester
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="bg-primary text-white hover:bg-primary/90"
            >
              UEIS
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsData}>
              <XAxis 
                dataKey="semester" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                domain={[1.0, 4.0]} 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#E5E7EB' }}
                label={{ value: 'CGPA', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ueis" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="UEIS"
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: "#3B82F6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
