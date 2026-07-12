import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onAnalysisComplete: (result: any) => void;
  language: string;
}

const translations = {
  en: {
    uploadTitle: 'Upload Crop Leaf Image',
    uploadSubtitle: 'Take a clear photo of the affected leaf for AI analysis',
    dragDrop: 'Drag and drop your image here, or click to browse',
    takePhoto: 'Take Photo',
    uploadFile: 'Upload File',
    analyzing: 'Analyzing your crop...',
    removeImage: 'Remove image',
    supportedFormats: 'Supported formats: JPG, PNG, WEBP (Max 10MB)'
  },
  hi: {
    uploadTitle: 'फसल की पत्ती की तस्वीर अपलोड करें',
    uploadSubtitle: 'AI विश्लेषण के लिए प्रभावित पत्ती की स्पष्ट तस्वीर लें',
    dragDrop: 'अपनी तस्वीर यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
    takePhoto: 'फोटो लें',
    uploadFile: 'फाइल अपलोड करें',
    analyzing: 'आपकी फसल का विश्लेषण कर रहे हैं...',
    removeImage: 'तस्वीर हटाएं',
    supportedFormats: 'समर्थित प्रारूप: JPG, PNG, WEBP (अधिकतम 10MB)'
  }
};

export const ImageUpload = ({ onImageUpload, onAnalysisComplete, language }: ImageUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const simulateAnalysis = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis with random results
    setTimeout(() => {
      const diseases = [
        {
          name: "Leaf Blight",
          confidence: 92,
          description: "A common fungal disease affecting crop leaves",
          prescription: "Apply copper-based fungicide spray",
          actions: ["Remove affected leaves", "Improve air circulation", "Apply fungicide"]
        },
        {
          name: "Bacterial Spot",
          confidence: 87,
          description: "Bacterial infection causing dark spots on leaves",
          prescription: "Use bactericide spray and improve drainage",
          actions: ["Remove infected leaves", "Apply bactericide", "Ensure proper drainage"]
        }
      ];
      
      const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
      onAnalysisComplete(randomDisease);
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">{t.uploadTitle}</h2>
        <p className="text-muted-foreground">{t.uploadSubtitle}</p>
      </div>

      {!imagePreview ? (
        <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
          <CardContent 
            className="p-8 text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg mb-2">{t.dragDrop}</p>
            <p className="text-sm text-muted-foreground mb-6">{t.supportedFormats}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>{t.takePhoto}</span>
              </Button>
              <Button
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{t.uploadFile}</span>
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Uploaded crop leaf"
                className="w-full h-64 sm:h-80 object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
                <span className="sr-only">{t.removeImage}</span>
              </Button>
            </div>
            <div className="p-4">
              <Button
                onClick={simulateAnalysis}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.analyzing}
                  </>
                ) : (
                  'Analyze Crop Disease'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};