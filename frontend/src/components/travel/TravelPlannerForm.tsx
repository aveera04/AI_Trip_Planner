import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles, Clock, CheckCircle, XCircle, Copy, Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TravelResponse {
  answer: string;
}

const TravelPlannerForm = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TravelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const exampleQueries = [
    "Plan a 5-day romantic trip to Paris with fine dining and museums",
    "Budget-friendly 3-day Tokyo adventure with street food and temples", 
    "Family vacation to Orlando with kids, theme parks and activities",
    "Adventure trip to New Zealand for 7 days with hiking and nature"
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
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

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TravelResponse = await response.json();
      setResponse(data);
      
      toast({
        title: "Travel plan generated!",
        description: "Your personalized itinerary is ready.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
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

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl font-bold text-foreground mb-4">
            Plan Your Perfect <span className="text-gradient-ocean">Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tell us about your dream trip and our AI will create a personalized itinerary just for you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-travel-large border-0 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-primary" />
                Describe Your Dream Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Example Queries */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">💡 Try these examples:</Label>
                <div className="grid grid-cols-1 gap-2">
                  {exampleQueries.map((example, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="p-3 h-auto text-left cursor-pointer hover:bg-primary hover:text-white transition-all text-wrap"
                      onClick={() => handleExampleClick(example)}
                    >
                      {example}
                    </Badge>
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

          {/* Response Display */}
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
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">Planning your perfect trip...</h3>
                  <p className="text-muted-foreground">Our AI is crafting a personalized itinerary just for you</p>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Oops!</strong> {error}
                  </AlertDescription>
                </Alert>
              )}

              {response && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold text-green-900">🌍 Your AI-Generated Travel Plan</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {response.answer}
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription>
                      ⚠️ This travel plan was generated by AI. Please verify all information, 
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
        </div>
      </div>
    </section>
  );
};

export default TravelPlannerForm;