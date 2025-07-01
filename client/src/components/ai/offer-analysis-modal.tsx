import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, Star, TrendingUp, Target, Lightbulb } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AiAnalysis {
  id: number;
  offerId: number;
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  categoryMatch: number;
  improvementSuggestions: string;
  titleSuggestions?: string;
  descriptionSuggestions?: string;
  categorySuggestions?: string;
  marketingTips?: string;
  status: string;
  analyzedAt: string;
}

interface OfferAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: number;
  offerTitle: string;
}

export function OfferAnalysisModal({ isOpen, onClose, offerId, offerTitle }: OfferAnalysisModalProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analysisData, isLoading } = useQuery({
    queryKey: ["/api/admin/offer-analysis", offerId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/offer-analysis/${offerId}`);
      return res.json();
    },
    enabled: isOpen && offerId > 0,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      const res = await apiRequest("POST", `/api/admin/analyze-offer/${offerId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offer-analysis", offerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      toast({
        title: "تم التحليل بنجاح",
        description: "تم تحليل العرض وإنشاء التوصيات",
      });
      setIsAnalyzing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحليل",
        description: error.message,
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      const res = await apiRequest("POST", `/api/admin/reanalyze-offer/${offerId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offer-analysis", offerId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      toast({
        title: "تم إعادة التحليل بنجاح",
        description: "تم إعادة تحليل العرض بنجاح",
      });
      setIsAnalyzing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إعادة التحليل",
        description: error.message,
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  const analysis: AiAnalysis | null = analysisData?.analysis || null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            تحليل العرض: {offerTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Analysis Actions */}
          <div className="flex gap-3">
            {!analysis && (
              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                تحليل العرض بالذكاء الاصطناعي
              </Button>
            )}

            {analysis && (
              <Button
                onClick={() => reanalyzeMutation.mutate()}
                disabled={isAnalyzing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                إعادة التحليل
              </Button>
            )}
          </div>

          {/* Loading State */}
          {(isLoading || isAnalyzing) && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                <p className="text-muted-foreground">
                  {isAnalyzing ? "جاري تحليل العرض..." : "جاري تحميل التحليل..."}
                </p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && !isAnalyzing && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    النتيجة الإجمالية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={analysis.overallScore} className="h-3" />
                    </div>
                    <Badge variant={getScoreBadgeVariant(analysis.overallScore)} className="text-lg px-3 py-1">
                      {analysis.overallScore}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      العنوان
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={analysis.titleScore} className="h-2" />
                      <div className={`text-lg font-bold ${getScoreColor(analysis.titleScore)}`}>
                        {analysis.titleScore}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      الوصف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={analysis.descriptionScore} className="h-2" />
                      <div className={`text-lg font-bold ${getScoreColor(analysis.descriptionScore)}`}>
                        {analysis.descriptionScore}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      التصنيف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={analysis.categoryMatch} className="h-2" />
                      <div className={`text-lg font-bold ${getScoreColor(analysis.categoryMatch)}`}>
                        {analysis.categoryMatch}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Improvement Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>التوصيات العامة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {analysis.improvementSuggestions}
                  </p>
                </CardContent>
              </Card>

              {/* Specific Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.titleSuggestions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">تحسين العنوان</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {analysis.titleSuggestions}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {analysis.descriptionSuggestions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">تحسين الوصف</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {analysis.descriptionSuggestions}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {analysis.categorySuggestions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">تحسين التصنيف</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {analysis.categorySuggestions}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {analysis.marketingTips && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">نصائح تسويقية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {analysis.marketingTips}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Analysis Date */}
              <div className="text-xs text-muted-foreground text-center pt-4 border-t">
                تم التحليل في: {new Date(analysis.analyzedAt).toLocaleDateString('ar-SA')} - {new Date(analysis.analyzedAt).toLocaleTimeString('ar-SA')}
              </div>
            </div>
          )}

          {/* No Analysis State */}
          {!analysis && !isLoading && !isAnalyzing && (
            <div className="text-center py-12 space-y-4">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-muted-foreground mb-4">لم يتم تحليل هذا العرض بعد</p>
                <Button onClick={() => analyzeMutation.mutate()} className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  تحليل العرض بالذكاء الاصطناعي
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}