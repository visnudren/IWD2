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
              All
            </Button>
            <Button 
              size="sm" 
              variant="outline"
            >
              CS
            </Button>
            <Button 
              size="sm" 
              variant="outline"
            >
              SE
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsData}>
              <XAxis dataKey="semester" />
              <YAxis domain={[2.5, 4.0]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cs" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Computer Science"
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line 
                type="monotone" 
                dataKey="se" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={2}
                name="Software Engineering"
                dot={{ fill: "hsl(var(--secondary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
