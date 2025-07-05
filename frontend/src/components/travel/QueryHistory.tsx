import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  History, 
  Search, 
  Clock, 
  Trash2, 
  RotateCcw,
  ChevronRight,
  Calendar
} from "lucide-react";
import { useQueryHistory, type QueryHistoryItem } from "@/hooks/useQueryHistory";

interface QueryHistoryProps {
  onSelectQuery: (query: string) => void;
  currentQuery?: string;
}

const QueryHistory = ({ onSelectQuery, currentQuery }: QueryHistoryProps) => {
  const { history, removeQuery, clearHistory, searchHistory } = useQueryHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const displayHistory = searchTerm 
    ? searchHistory(searchTerm) 
    : history.slice(0, isExpanded ? history.length : 5);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  const truncateQuery = (query: string, maxLength: number = 80) => {
    return query.length > maxLength ? query.substring(0, maxLength) + "..." : query;
  };

  if (history.length === 0) {
    return (
      <Card className="shadow-travel border-0 bg-gradient-card backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-primary" />
            Query History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="text-center py-4">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No previous queries yet. Start planning your first trip!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-travel border-0 bg-gradient-card backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5 text-primary" />
          Query History
          <Badge variant="secondary" className="ml-auto">
            {history.length}
          </Badge>
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayHistory.length === 0 && searchTerm && (
          <Alert>
            <AlertDescription>
              No queries found matching "{searchTerm}"
            </AlertDescription>
          </Alert>
        )}

        {displayHistory.map((item: QueryHistoryItem, index: number) => (
          <div
            key={item.id}
            className={`group p-3 rounded-lg border transition-all cursor-pointer hover:border-primary hover:bg-primary/5 ${
              currentQuery === item.query ? 'border-primary bg-primary/10' : 'border-gray-200'
            }`}
            onClick={() => onSelectQuery(item.query)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {truncateQuery(item.query)}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.timestamp)}
                  </div>
                  
                  {item.response?.processingTime && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {(item.response.processingTime / 1000).toFixed(1)}s
                    </div>
                  )}
                </div>

                {item.response && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      ✅ Plan Generated
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectQuery(item.query);
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeQuery(item.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {!searchTerm && history.length > 5 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : `Show All ${history.length} Queries`}
            <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        )}

        <Separator />

        <Button
          variant="outline"
          size="sm"
          className="w-full text-red-600 hover:text-red-800"
          onClick={clearHistory}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All History
        </Button>
      </CardContent>
    </Card>
  );
};

export default QueryHistory;
