import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Leaf, Bug, Droplets, Sun } from 'lucide-react';

const Explore = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: 'Explore Crop Diseases',
      subtitle: 'Search and learn about various crop diseases and their treatments',
      searchPlaceholder: 'Search for crop diseases, symptoms, or treatments...',
      commonDiseases: 'Common Crop Diseases',
      symptoms: 'Symptoms',
      treatment: 'Treatment',
      prevention: 'Prevention'
    },
    hi: {
      title: 'फसल रोगों की खोज करें',
      subtitle: 'विभिन्न फसल रोगों और उनके उपचार के बारे में खोजें और जानें',
      searchPlaceholder: 'फसल रोग, लक्षण या उपचार खोजें...',
      commonDiseases: 'सामान्य फसल रोग',
      symptoms: 'लक्षण',
      treatment: 'उपचार',
      prevention: 'रोकथाम'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  const diseases = [
    {
      name: 'Leaf Blight',
      crop: 'Wheat',
      symptoms: 'Brown spots on leaves, yellowing',
      treatment: 'Fungicide spray, copper-based treatments',
      prevention: 'Crop rotation, proper drainage',
      severity: 'High'
    },
    {
      name: 'Bacterial Spot',
      crop: 'Tomato',
      symptoms: 'Dark spots with yellow halos',
      treatment: 'Bactericide application, remove infected parts',
      prevention: 'Use disease-free seeds, avoid overhead watering',
      severity: 'Medium'
    },
    {
      name: 'Powdery Mildew',
      crop: 'Grapes',
      symptoms: 'White powdery coating on leaves',
      treatment: 'Sulfur-based fungicide, neem oil',
      prevention: 'Good air circulation, avoid overcrowding',
      severity: 'Medium'
    }
  ];

  const filteredDiseases = diseases.filter(disease =>
    disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disease.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    disease.symptoms.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data.reply);
    } catch (error) {
      setResponse('AI assistant is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">{t.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Disease Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">{t.commonDiseases}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDiseases.map((disease, index) => (
              <Card key={index} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{disease.name}</CardTitle>
                    <Badge variant={disease.severity === 'High' ? 'destructive' : 'default'}>
                      {disease.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Leaf className="w-4 h-4" />
                    <span>{disease.crop}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Bug className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{t.symptoms}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{disease.symptoms}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{t.treatment}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{disease.treatment}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Sun className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{t.prevention}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{disease.prevention}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Ask CropCare AI
        </h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border rounded p-3 text-sm"
            rows={4}
            placeholder="Ask about any crop disease, symptoms, or treatments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            type="submit"
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Thinking...' : 'Ask AI'}
          </Button>
        </form>

        {response && (
          <div className="mt-6 bg-gray-100 p-4 rounded">
            <strong className="text-primary">AI Response:</strong>
            <p className="mt-2 text-sm whitespace-pre-line">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;