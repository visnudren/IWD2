import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function PredictiveAnalytics() {
  return (
    <Card className="border-l-4 border-primary">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Brain className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-medium text-gray-900">AI-Powered Risk Prediction</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Machine learning algorithms analyze student performance patterns to predict academic risk 
          2-3 semesters in advance, enabling proactive intervention.
        </p>
        <Button 
          className="w-full bg-primary text-white hover:bg-primary/90"
          onClick={() => {
            // This would open a detailed predictive analytics dashboard
            console.log("Opening predictive analytics...");
          }}
        >
          View Predictions
        </Button>
      </CardContent>
    </Card>
  );
}
