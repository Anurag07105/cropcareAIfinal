import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PredictionReport, type PredictionHistoryItem } from '@/components/PredictionReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPredictionHistoryItem } from '../api';

const HistoryReport = () => {
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  const { id } = useParams();
  const reportRef = useRef<HTMLDivElement>(null);

  const {
    data: item,
    isLoading,
    isError,
  } = useQuery<PredictionHistoryItem>({
    queryKey: ['prediction-history', id],
    queryFn: () => getPredictionHistoryItem(id),
    enabled: Boolean(id),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/history">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to History</span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="p-8 text-center">
              <p>Loading saved report...</p>
            </CardContent>
          </Card>
        ) : isError || !item ? (
          <Card className="border-l-4 border-l-destructive shadow-medium">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Unable to load this prediction report.</p>
            </CardContent>
          </Card>
        ) : (
          <PredictionReport item={item} language={selectedLanguage} reportRef={reportRef} />
        )}
      </div>
    </div>
  );
};

export default HistoryReport;
