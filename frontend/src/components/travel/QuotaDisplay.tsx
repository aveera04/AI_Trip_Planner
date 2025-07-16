import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Zap } from "lucide-react";
import { 
  getRemainingQueries, 
  getFormattedTimeUntilReset, 
  getDailyQuota 
} from "@/lib/quota";

export default function QuotaDisplay() {
  const [remaining, setRemaining] = useState(getRemainingQueries());
  const [resetTime, setResetTime] = useState(getFormattedTimeUntilReset());
  
  // Update the countdown every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getRemainingQueries());
      setResetTime(getFormattedTimeUntilReset());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const quotaPercentage = (remaining / getDailyQuota()) * 100;
  
  return (
    <Card className="shadow-travel border-0 bg-gradient-card backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium">Daily Free Queries</span>
            </div>
            <Badge variant={remaining > 0 ? "default" : "destructive"}>
              {remaining} of {getDailyQuota()} left
            </Badge>
          </div>
          
          <Progress value={quotaPercentage} className="h-2" />
          
          {remaining === 0 && (
            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Daily limit reached</p>
                <p className="text-xs mt-1">
                  Resets in <span className="font-semibold">{resetTime}</span>
                </p>
              </div>
            </div>
          )}
          
          {remaining > 0 && remaining <= 2 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>
                {remaining} {remaining === 1 ? 'query' : 'queries'} remaining • Resets in {resetTime}
              </span>
            </div>
          )}
          
          {remaining > 2 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Resets in {resetTime}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
