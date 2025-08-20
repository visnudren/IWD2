import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box } from "lucide-react";

export default function ThreeDVisualization() {
  return (
    <Card className="border-l-4 border-accent">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Box className="w-6 h-6 text-accent mr-3" />
          <h3 className="text-lg font-medium text-gray-900">3D Progress Visualization</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Interactive 3D visualizations of student academic journeys, showing progression paths, 
          achievements, and potential routes to graduation.
        </p>
        <Button 
          className="w-full bg-accent text-white hover:bg-accent/90"
          onClick={() => {
            // This would launch the 3D visualization interface
            console.log("Opening 3D visualization...");
          }}
        >
          Launch 3D View
        </Button>
      </CardContent>
    </Card>
  );
}
