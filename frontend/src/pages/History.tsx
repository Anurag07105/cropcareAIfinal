import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Download, Eye, Leaf, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PredictionReport, type PredictionHistoryItem } from '@/components/PredictionReport';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { downloadReportElement } from '@/lib/reportDownload';
import { deletePredictionHistoryItem, getPredictionHistory } from '../api';

const History = () => {
  const selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  const queryClient = useQueryClient();
  const downloadRef = useRef<HTMLDivElement>(null);
  const [downloadItem, setDownloadItem] = useState<PredictionHistoryItem | null>(null);

  const {
    data: history = [],
    isLoading,
    isError,
  } = useQuery<PredictionHistoryItem[]>({
    queryKey: ['prediction-history'],
    queryFn: getPredictionHistory,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePredictionHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prediction-history'] });
      toast({
        title: 'Prediction deleted',
        description: 'The report and stored image were removed.',
      });
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Unable to delete this prediction. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: number) => {
    const confirmed = window.confirm('Delete this prediction and its stored image?');
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = async (item: PredictionHistoryItem) => {
    setDownloadItem(item);
    window.setTimeout(async () => {
      await downloadReportElement(downloadRef.current, item.created_at);
      setDownloadItem(null);
    }, 0);
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">Prediction History</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Review previous crop disease reports and download saved recommendations.
          </p>
        </div>

        {isLoading ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="p-8 text-center">
              <p>Loading prediction history...</p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="border-l-4 border-l-destructive shadow-medium">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Unable to load prediction history.</p>
            </CardContent>
          </Card>
        ) : history.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
              <p className="text-muted-foreground">
                Upload a crop image from the home page to create your first saved report.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-medium transition-shadow">
                <div className="aspect-[4/3] bg-muted">
                  <img
                    src={item.image_url}
                    alt={item.crop_name ? `${item.crop_name} crop leaf` : 'Uploaded crop leaf'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{item.disease || 'Unknown disease'}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                        <Leaf className="w-4 h-4" />
                        <span>{item.crop_name || 'Unknown crop'}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{item.confidence || 0}%</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link to={`/history/${item.id}`}>
                      <Button variant="outline" className="w-full flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>View Report</span>
                      </Button>
                    </Link>
                    <Button
                      variant="default"
                      className="w-full flex items-center space-x-2"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report</span>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full flex items-center space-x-2"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {downloadItem && (
        <div className="fixed top-0 left-[-10000px] w-[896px] bg-background p-8">
          <PredictionReport item={downloadItem} language={selectedLanguage} reportRef={downloadRef} />
        </div>
      )}
    </div>
  );
};

export default History;
