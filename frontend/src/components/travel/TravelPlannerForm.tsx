import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles, Clock, CheckCircle, XCircle, Copy, Download, Share, Wifi, WifiOff, Maximize, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, type TravelPlanResponse } from "@/services/api";
import { useQueryHistory } from "@/hooks/useQueryHistory";
import QueryHistory from "@/components/travel/QueryHistory";
import ExportMenu from "@/components/travel/ExportMenu";
import RateLimitDialog from "@/components/travel/RateLimitDialog";
import { hasRemainingQueries, recordQueryUsage } from "@/lib/quota";
import "highlight.js/styles/github.css"; // Import highlight.js theme

interface TravelPlannerFormProps {
  initialQuery?: string;
  autoSubmit?: boolean;
  onQueryProcessed?: () => void;
}

const TravelPlannerForm = ({ initialQuery = "", autoSubmit = false, onQueryProcessed }: TravelPlannerFormProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TravelPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [requestTimestamp, setRequestTimestamp] = useState<Date | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Planning your perfect trip...");
  const [currentQueryId, setCurrentQueryId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showRateLimitDialog, setShowRateLimitDialog] = useState(false);
  const { toast } = useToast();
  const { addQuery, updateQueryResponse } = useQueryHistory();

  const loadingMessages = [
    "Planning your perfect trip...",
    "Analyzing destinations and attractions...", 
    "Crafting your personalized itinerary...",
    "Finding the best activities for you...",
    "Optimizing travel routes and schedules...",
    "Adding local insights and recommendations..."
  ];

  const exampleQueries = [
    {
      category: "Romance",
      query: "Plan a 5-day romantic trip to Paris with fine dining and museums",
      icon: "💕"
    },
    {
      category: "Adventure",
      query: "Budget-friendly 3-day Tokyo adventure with street food and temples",
      icon: "🗾"
    },
    {
      category: "Family",
      query: "Family vacation to Orlando with kids, theme parks and activities",
      icon: "👨‍👩‍👧‍👦"
    },
    {
      category: "Nature",
      query: "Adventure trip to New Zealand for 7 days with hiking and nature",
      icon: "🏔️"
    },
    {
      category: "Cultural",
      query: "Cultural tour of Italy for 10 days with art, history, and cuisine",
      icon: "🏛️"
    },
    {
      category: "Luxury",
      query: "Luxury beach vacation in Maldives for a week with spa and water sports",
      icon: "🏖️"
    }
  ];

  // Check connection status on component mount and periodically
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await apiService.testConnection();
      setIsConnected(connected);
    };

    // Check immediately
    checkConnection();

    // Check every 30 seconds if not connected
    const interval = setInterval(() => {
      if (!isConnected) {
        checkConnection();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Cycle through loading messages during processing
  useEffect(() => {
    if (!isLoading) return;

    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [isLoading, loadingMessages]);

  // Handle initial query from hero section
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Handle auto-submission from hero section
  useEffect(() => {
    const submitQuery = async () => {
      if (autoSubmit && initialQuery && !isLoading && query === initialQuery) {
        // Small delay to ensure the UI has updated
        setTimeout(() => {
          handleSubmit();
        }, 500);
        
        if (onQueryProcessed) {
          onQueryProcessed();
        }
      }
    };

    submitQuery();
  }, [autoSubmit, initialQuery, query, isLoading]);

  const handleExampleClick = (example: { category: string; query: string; icon: string }) => {
    setQuery(example.query);
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    // Optionally auto-submit if you want immediate results
    // setTimeout(() => handleSubmit(), 100);
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter your travel request",
        description: "Tell us about your dream trip!",
        variant: "destructive",
      });
      return;
    }

    // Check daily quota before processing
    if (!hasRemainingQueries()) {
      setShowRateLimitDialog(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setProcessingTime(null);
    
    const startTime = new Date();
    setRequestTimestamp(startTime);

    // Add query to history immediately
    const queryId = addQuery(query.trim());
    setCurrentQueryId(queryId);

    try {
      // Test connection first
      const connectionOk = await apiService.testConnection();
      setIsConnected(connectionOk);
      
      if (!connectionOk) {
        throw new Error('Unable to connect to the travel planning service. Please check your connection.');
      }

      // Generate travel plan using API service
      const data = await apiService.generateTravelPlan({ question: query });
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      setProcessingTime(duration);
      setResponse(data);

      // Record successful query usage
      recordQueryUsage();

      // Update history with response
      updateQueryResponse(queryId, {
        answer: data.answer,
        processingTime: duration
      });
      
      toast({
        title: "Travel plan generated!",
        description: "Your personalized itinerary is ready.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setIsConnected(false);
      
      toast({
        title: "Failed to generate travel plan",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (response?.answer) {
      navigator.clipboard.writeText(response.answer);
      toast({
        title: "Copied to clipboard!",
        description: "Travel plan has been copied to your clipboard.",
      });
    }
  };

  const saveToFile = () => {
    if (response?.answer) {
      const blob = new Blob([response.answer], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-plan-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Travel plan saved!",
        description: "Your itinerary has been downloaded as a text file.",
      });
    }
  };

  const shareViaWeb = async () => {
    if (response?.answer && navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Travel Plan',
          text: response.answer,
        });
        toast({
          title: "Shared successfully!",
          description: "Your travel plan has been shared.",
        });
      } catch (err) {
        // Fallback to clipboard if sharing fails
        copyToClipboard();
      }
    } else {
      // Fallback to clipboard for browsers without Web Share API
      copyToClipboard();
    }
  };

  const handleRetry = async () => {
    if (query.trim()) {
      // Add small delay to show retry action
      setError(null);
      toast({
        title: "Retrying...",
        description: "Attempting to reconnect and generate your travel plan.",
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleSubmit();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  // Fullscreen Modal Component
  const FullscreenModal = ({ children }: { children: React.ReactNode }) => {
    if (!isFullscreen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-white overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold">Travel Plan - Full Screen</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <ExportMenu 
                travelPlan={{
                  answer: response?.answer || "",
                  query: response?.query || query,
                  timestamp: response?.timestamp,
                  processingTime: processingTime || undefined
                }}
              />
              <Button variant="outline" size="sm" onClick={shareViaWeb}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={closeFullscreen}>
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl font-bold text-foreground mb-4">
            Plan Your Perfect <span className="text-gradient-ocean">Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell us about your dream trip and our AI will create a personalized itinerary just for you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Query History Sidebar */}
          <div className="lg:order-first">
            <QueryHistory 
              onSelectQuery={handleHistorySelect}
              currentQuery={query}
            />
          </div>

          {/* Main Content - Input Form */}
          <div className="lg:col-span-2 space-y-8">
          {/* Input Form */}
          <Card className="shadow-travel-large border-0 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-primary" />
                Describe Your Dream Trip
                {/* Connection Status Indicator */}
                <div className="ml-auto flex items-center gap-1">
                  {isConnected ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Wifi className="w-4 h-4" />
                      <span className="text-xs font-normal">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <WifiOff className="w-4 h-4" />
                      <span className="text-xs font-normal">Disconnected</span>
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Example Queries */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">💡 Try these examples:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exampleQueries.map((example, index) => (
                    <div
                      key={index}
                      className="group p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200"
                      onClick={() => handleExampleClick(example)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{example.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-primary mb-1">{example.category}</div>
                          <div className="text-sm text-gray-600 group-hover:text-gray-800">{example.query}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Query Input */}
              <div className="space-y-2">
                <Label htmlFor="query" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  Your Travel Request
                </Label>
                <Textarea 
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="✈️ Describe your ideal trip - destination, duration, interests, budget, travel style..."
                  className="min-h-[150px] border-primary/20 focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !query.trim()}
                variant="hero" 
                size="xl" 
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating Your Perfect Trip...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Generate My Travel Plan
                  </>
                )}
              </Button>

              {/* Current Request Display */}
              {(isLoading || response || error) && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Your Request:</p>
                        <p className="text-sm text-blue-700 mt-1">{query}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Response Display Card */}
          <Card className="shadow-travel-large border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                {isLoading && <Clock className="w-6 h-6 text-primary animate-pulse" />}
                {response && <CheckCircle className="w-6 h-6 text-green-500" />}
                {error && <XCircle className="w-6 h-6 text-red-500" />}
                {!isLoading && !response && !error && <MapPin className="w-6 h-6 text-muted-foreground" />}
                Travel Plan
              </CardTitle>
              {response && (
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    <Maximize className="w-4 h-4 mr-2" />
                    Full Screen
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  
                  <ExportMenu 
                    travelPlan={{
                      answer: response.answer,
                      query: response.query || query,
                      timestamp: response.timestamp,
                      processingTime: processingTime || undefined
                    }}
                  />
                  
                  <Button variant="outline" size="sm" onClick={shareViaWeb}>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-pulse text-2xl">✈️</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-primary">{loadingMessage}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>AI is working</span>
                    <div className="flex gap-1">
                      <span className="animate-bounce delay-0">.</span>
                      <span className="animate-bounce delay-150">.</span>
                      <span className="animate-bounce delay-300">.</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    This may take a few moments while we craft your perfect itinerary
                  </div>
                </div>
              )}

              {error && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Oops!</strong> {error}
                    </AlertDescription>
                  </Alert>
                  
                  {/* Retry Button */}
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleRetry} 
                      variant="outline" 
                      className="flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <Sparkles className="w-4 h-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {response && (
                <div className="space-y-6">
                  {/* Header with Metadata - Enhanced Streamlit Style */}
                  <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-6 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-bold text-green-900">🌍 AI Travel Plan</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-600">Generated:</span>
                        <span className="text-gray-800">
                          {requestTimestamp ? requestTimestamp.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'N/A'}
                        </span>
                        <span className="text-gray-600 text-xs">
                          at {requestTimestamp ? requestTimestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-600">Processing Time:</span>
                        <span className="text-gray-800">
                          {processingTime ? `${(processingTime / 1000).toFixed(1)}s` : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-600">Created by:</span>
                        <span className="text-gray-800">AI Travel Agent</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-green-300">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-600 mb-2">Your Query:</span>
                        <div className="bg-white p-3 rounded-lg border italic text-gray-700">
                          "{response.query || query}"
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Markdown Rendered Content */}
                  <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="prose prose-lg prose-slate max-w-none markdown-content relative">
                        {/* Decorative background pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none">
                          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl"></div>
                          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-green-200 to-blue-200 rounded-full blur-2xl"></div>
                        </div>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            h1: ({ children }) => (
                              <div className="relative mb-8 mt-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"></div>
                                <h1 className="relative text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent p-6 text-center">
                                  {children}
                                </h1>
                              </div>
                            ),
                            h2: ({ children }) => (
                              <div className="flex items-center gap-3 mb-6 mt-10">
                                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-gray-800 flex-1 border-b border-gray-200 pb-2">
                                  {children}
                                </h2>
                                <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
                              </div>
                            ),
                            h3: ({ children }) => (
                              <div className="flex items-center gap-2 mb-4 mt-8">
                                <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                                <h3 className="text-xl font-semibold text-gray-700 bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 rounded-lg flex-1">
                                  {children}
                                </h3>
                              </div>
                            ),
                            h4: ({ children }) => (
                              <h4 className="text-lg font-semibold text-gray-600 mb-3 mt-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                {children}
                              </h4>
                            ),
                            p: ({ children }) => (
                              <p className="text-gray-700 leading-relaxed mb-4 text-base tracking-wide">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-3 mb-6 ml-2">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="space-y-3 mb-6 ml-2 counter-reset-[list-counter]">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="flex items-start gap-3 text-gray-700 bg-gray-50/50 p-3 rounded-lg hover:bg-gray-100/50 transition-colors">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="flex-1">{children}</span>
                              </li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-gray-900">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic text-blue-600 font-medium">
                                {children}
                              </em>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="relative border-l-4 border-green-400 bg-gradient-to-r from-green-50 to-yellow-50 pl-6 pr-4 py-4 italic text-gray-700 my-6 rounded-r-lg shadow-sm">
                                <div className="absolute top-2 left-2 text-green-500 text-2xl opacity-50">"</div>
                                {children}
                              </blockquote>
                            ),
                            code: ({ children }) => (
                              <code className="bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-md text-sm font-mono text-gray-800 border border-gray-300">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm border border-gray-700 shadow-lg my-6">
                                {children}
                              </pre>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-6 rounded-lg shadow-sm border border-gray-200">
                                <table className="w-full bg-white">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody className="divide-y divide-gray-200">
                                {children}
                              </tbody>
                            ),
                            tr: ({ children }) => (
                              <tr className="hover:bg-gray-50 transition-colors">
                                {children}
                              </tr>
                            ),
                            th: ({ children }) => (
                              <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                                {children}
                              </td>
                            ),
                            hr: () => (
                              <div className="my-8 flex items-center justify-center">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                <div className="mx-4 w-2 h-2 bg-blue-400 rounded-full"></div>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                              </div>
                            ),
                            a: ({ children, href }) => (
                              <a 
                                href={href} 
                                className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors font-medium"
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            )
                          }}
                        >
                          {response.answer}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Footer Disclaimer */}
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertDescription className="text-yellow-800">
                      ⚠️ <strong>Important:</strong> This travel plan was generated by AI. Please verify all information, 
                      especially prices, operating hours, and travel requirements before your trip.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {!isLoading && !response && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <MapPin className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Ready to plan your trip?</h3>
                  <p>Describe your dream destination and let our AI create the perfect itinerary for you!</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          </div> {/* End of main content */}
        </div> {/* End of grid */}

        {/* Fullscreen Modal */}
        <FullscreenModal>
          {response && (
            <div className="space-y-6">
              {/* Header with Metadata - Enhanced Streamlit Style */}
              <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-6 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-green-900">🌍 AI Travel Plan</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-600">Generated:</span>
                    <span className="text-gray-800">
                      {requestTimestamp ? requestTimestamp.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </span>
                    <span className="text-gray-600 text-xs">
                      at {requestTimestamp ? requestTimestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-600">Processing Time:</span>
                    <span className="text-gray-800">
                      {processingTime ? `${(processingTime / 1000).toFixed(1)}s` : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-600">Created by:</span>
                    <span className="text-gray-800">AI Travel Agent</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-300">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-600 mb-2">Your Query:</span>
                    <div className="bg-white p-3 rounded-lg border italic text-gray-700">
                      "{response.query || query}"
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Markdown Rendered Content */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="prose prose-lg prose-slate max-w-none markdown-content relative">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                      <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-green-200 to-blue-200 rounded-full blur-2xl"></div>
                    </div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: ({ children }) => (
                          <div className="relative mb-8 mt-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"></div>
                            <h1 className="relative text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent p-6 text-center">
                              {children}
                            </h1>
                          </div>
                        ),
                        h2: ({ children }) => (
                          <div className="flex items-center gap-3 mb-6 mt-10">
                            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-gray-800 flex-1 border-b border-gray-200 pb-2">
                              {children}
                            </h2>
                            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></div>
                          </div>
                        ),
                        h3: ({ children }) => (
                          <div className="flex items-center gap-2 mb-4 mt-8">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                            <h3 className="text-xl font-semibold text-gray-700 bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 rounded-lg flex-1">
                              {children}
                            </h3>
                          </div>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-lg font-semibold text-gray-600 mb-3 mt-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                            {children}
                          </h4>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-700 leading-relaxed mb-4 text-base tracking-wide">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-3 mb-6 ml-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="space-y-3 mb-6 ml-2 counter-reset-[list-counter]">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="flex items-start gap-3 text-gray-700 bg-gray-50/50 p-3 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="flex-1">{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-gray-900">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-blue-600 font-medium">
                            {children}
                          </em>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="relative border-l-4 border-green-400 bg-gradient-to-r from-green-50 to-yellow-50 pl-6 pr-4 py-4 italic text-gray-700 my-6 rounded-r-lg shadow-sm">
                            <div className="absolute top-2 left-2 text-green-500 text-2xl opacity-50">"</div>
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-md text-sm font-mono text-gray-800 border border-gray-300">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm border border-gray-700 shadow-lg my-6">
                            {children}
                          </pre>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-6 rounded-lg shadow-sm border border-gray-200">
                            <table className="w-full bg-white">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {children}
                          </thead>
                        ),
                        tbody: ({ children }) => (
                          <tbody className="divide-y divide-gray-200">
                            {children}
                          </tbody>
                        ),
                        tr: ({ children }) => (
                          <tr className="hover:bg-gray-50 transition-colors">
                            {children}
                          </tr>
                        ),
                        th: ({ children }) => (
                          <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                            {children}
                          </td>
                        ),
                        hr: () => (
                          <div className="my-8 flex items-center justify-center">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <div className="mx-4 w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                          </div>
                        ),
                        a: ({ children, href }) => (
                          <a 
                            href={href} 
                            className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors font-medium"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        )
                      }}
                    >
                      {response.answer}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Footer Disclaimer */}
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800">
                  ⚠️ <strong>Important:</strong> This travel plan was generated by AI. Please verify all information, 
                  especially prices, operating hours, and travel requirements before your trip.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </FullscreenModal>
        
        {/* Rate Limit Dialog */}
        <RateLimitDialog 
          isOpen={showRateLimitDialog} 
          onClose={() => setShowRateLimitDialog(false)} 
        />
      </div> {/* End of max-w-7xl container */}
    </section>
  );
};

export default TravelPlannerForm;