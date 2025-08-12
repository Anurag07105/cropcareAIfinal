import { useState, useEffect } from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Navbar } from '@/components/Navbar';
import { ImageUpload } from '@/components/ImageUpload';
import { AnalysisResult } from '@/components/AnalysisResult';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, Shield, Users, Target, ArrowRight, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-agriculture.jpg';

const Index = () => {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (!savedLanguage) {
      setShowLanguageSelector(true);
    } else {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguageSelector(false);
  };

  const translations = {
    en: {
      hero: {
        title: 'Protect Your Crops with AI-Powered Disease Detection',
        subtitle: 'Upload a photo of your crop leaf and get instant AI analysis with treatment recommendations',
        cta: 'Start Analysis',
        features: 'Key Features'
      },
      features: [
        {
          icon: Leaf,
          title: 'Instant Detection',
          description: 'Get disease identification in seconds using advanced AI technology'
        },
        {
          icon: Shield,
          title: 'Expert Recommendations',
          description: 'Receive treatment plans and preventive measures from agricultural experts'
        },
        {
          icon: Users,
          title: 'Community Support',
          description: 'Connect with farmers worldwide and share experiences'
        },
        {
          icon: Target,
          title: '94% Accuracy',
          description: 'Trusted by over 50,000 farmers with proven results'
        }
      ],
      stats: {
        farmers: '50,000+ Farmers Helped',
        accuracy: '94% Detection Accuracy',
        diseases: '200+ Diseases Detected'
      }
    },
    hi: {
      hero: {
        title: 'AI-संचालित रोग पहचान के साथ अपनी फसलों की सुरक्षा करें',
        subtitle: 'अपनी फसल की पत्ती की तस्वीर अपलोड करें और उपचार सुझावों के साथ तुरंत AI विश्लेषण पाएं',
        cta: 'विश्लेषण शुरू करें',
        features: 'मुख्य विशेषताएं'
      },
      features: [
        {
          icon: Leaf,
          title: 'तुरंत पहचान',
          description: 'उन्नत AI तकनीक का उपयोग करके सेकंडों में रोग की पहचान पाएं'
        },
        {
          icon: Shield,
          title: 'विशेषज्ञ सुझाव',
          description: 'कृषि विशेषज्ञों से उपचार योजना और बचाव के उपाय प्राप्त करें'
        },
        {
          icon: Users,
          title: 'समुदायिक सहायता',
          description: 'दुनियाभर के किसानों से जुड़ें और अनुभव साझा करें'
        },
        {
          icon: Target,
          title: '94% सटीकता',
          description: '50,000+ किसानों द्वारा विश्वसनीय परिणामों के साथ भरोसेमंद'
        }
      ],
      stats: {
        farmers: '50,000+ किसानों की मदद की',
        accuracy: '94% पहचान सटीकता',
        diseases: '200+ रोगों का पता लगाया'
      }
    }
  };

  if (showLanguageSelector) {
    return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
  }

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Agricultural landscape" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Agriculture
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-primary leading-tight">
                {t.hero.title}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t.hero.subtitle}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-6 text-lg">
                {t.hero.cta}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-card/50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
              <p className="text-muted-foreground">{t.stats.farmers}</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">94%</div>
              <p className="text-muted-foreground">{t.stats.accuracy}</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">200+</div>
              <p className="text-muted-foreground">{t.stats.diseases}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Upload Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <ImageUpload 
                onImageUpload={setUploadedImage}
                onAnalysisComplete={setAnalysisResult}
                language={selectedLanguage}
              />
            </div>
            
            <div>
              {analysisResult ? (
                <AnalysisResult result={analysisResult} language={selectedLanguage} />
              ) : (
                <Card className="border-dashed border-2 border-muted">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Leaf className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
                    <p className="text-muted-foreground">
                      Upload an image to see AI-powered disease analysis and treatment recommendations
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">{t.hero.features}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-medium transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
