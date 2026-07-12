import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

interface LanguageSelectorProps {
  onLanguageSelect: (language: string) => void;
}

export const LanguageSelector = ({ onLanguageSelect }: LanguageSelectorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    onLanguageSelect(languageCode);
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-strong">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">
            Choose Your Language / भाषा चुनें
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Select your preferred language to continue
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="outline"
              className="w-full justify-start h-12 text-left hover:bg-accent transition-colors"
              onClick={() => handleLanguageSelect(language.code)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{language.name}</span>
                <span className="text-sm text-muted-foreground">{language.nativeName}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};