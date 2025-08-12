import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, Pill, Sprout, Download, Share2 } from 'lucide-react';

interface AnalysisResult {
  name: string;
  confidence: number;
  description: string;
  prescription: string;
  actions: string[];
}

interface AnalysisResultProps {
  result: AnalysisResult;
  language: string;
}

const translations = {
  en: {
    diseaseDetected: 'Disease Detected',
    confidence: 'Confidence',
    description: 'Description',
    prescription: 'Prescription',
    recommendedActions: 'Recommended Actions',
    downloadReport: 'Download Report',
    shareResults: 'Share Results',
    severity: {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority'
    }
  },
  hi: {
    diseaseDetected: 'रोग का पता चला',
    confidence: 'विश्वसनीयता',
    description: 'विवरण',
    prescription: 'दवा',
    recommendedActions: 'सुझावित कार्य',
    downloadReport: 'रिपोर्ट डाउनलोड करें',
    shareResults: 'परिणाम साझा करें',
    severity: {
      high: 'उच्च प्राथमिकता',
      medium: 'मध्यम प्राथमिकता',
      low: 'कम प्राथमिकता'
    }
  }
};

export const AnalysisResult = ({ result, language }: AnalysisResultProps) => {
  const t = translations[language as keyof typeof translations] || translations.en;

  const getSeverity = (confidence: number) => {
    if (confidence >= 85) return 'high';
    if (confidence >= 70) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const severity = getSeverity(result.confidence);

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <span>{t.diseaseDetected}</span>
            </CardTitle>
            <Badge variant={getSeverityColor(severity)}>
              {t.severity[severity as keyof typeof t.severity]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Disease Name and Confidence */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">{result.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{t.confidence}:</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{result.confidence}%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center space-x-2">
              <Sprout className="w-4 h-4 text-primary" />
              <span>{t.description}</span>
            </h4>
            <p className="text-muted-foreground leading-relaxed">{result.description}</p>
          </div>

          <Separator />

          {/* Prescription */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center space-x-2">
              <Pill className="w-4 h-4 text-primary" />
              <span>{t.prescription}</span>
            </h4>
            <div className="bg-accent/50 p-4 rounded-lg">
              <p className="text-accent-foreground">{result.prescription}</p>
            </div>
          </div>

          <Separator />

          {/* Recommended Actions */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>{t.recommendedActions}</span>
            </h4>
            <ul className="space-y-2">
              {result.actions.map((action, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">{index + 1}</span>
                  </div>
                  <span className="text-muted-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="default" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>{t.downloadReport}</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>{t.shareResults}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};