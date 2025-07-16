import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Zap } from "lucide-react";
import { getFormattedTimeUntilReset, getDailyQuota } from "@/lib/quota";

interface RateLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RateLimitDialog({ isOpen, onClose }: RateLimitDialogProps) {
  const resetTime = getFormattedTimeUntilReset();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Daily Rate Limit Exceeded
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                API constraints at our end
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  You've used all {getDailyQuota()} free queries for today
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Due to API constraints, we limit each user to {getDailyQuota()} free travel plan generations per day.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Your quota resets in {resetTime}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Come back tomorrow to generate more amazing travel plans!
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Pro tip:</p>
            <p>Make the most of your queries by being specific about your destination, duration, interests, and budget in your requests.</p>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
