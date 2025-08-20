import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function CollaborativePlanning() {
  return (
    <Card className="border-l-4 border-secondary">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Users className="w-6 h-6 text-secondary mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Collaborative Planning</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Real-time collaborative workspace for academic advisors, programme leaders, and students 
          to plan course progression and track goals together.
        </p>
        <Button 
          className="w-full bg-secondary text-white hover:bg-secondary/90"
          onClick={() => {
            // This would open the collaborative planning interface
            console.log("Opening collaborative planning...");
          }}
        >
          Start Planning
        </Button>
      </CardContent>
    </Card>
  );
}
