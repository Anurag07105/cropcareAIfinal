import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Send, Phone, Mail, MessageCircle, BookOpen, Video, FileText } from 'lucide-react';

const Help = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );

  const translations = {
    en: {
      title: 'Help & Support',
      subtitle: 'Get help with using CropCare AI platform',
      quickHelp: 'Quick Help',
      faq: 'Frequently Asked Questions',
      contactSupport: 'Contact Support',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      sendMessage: 'Send Message',
      callSupport: 'Call Support',
      emailSupport: 'Email Support',
      liveChat: 'Live Chat',
      tutorials: 'Video Tutorials',
      documentation: 'Documentation',
      userGuide: 'User Guide'
    },
    hi: {
      title: 'सहायता और समर्थन',
      subtitle: 'क्रॉपकेयर AI प्लेटफॉर्म का उपयोग करने में सहायता पाएं',
      quickHelp: 'त्वरित सहायता',
      faq: 'अक्सर पूछे जाने वाले प्रश्न',
      contactSupport: 'समर्थन से संपर्क करें',
      name: 'नाम',
      email: 'ईमेल',
      subject: 'विषय',
      message: 'संदेश',
      sendMessage: 'संदेश भेजें',
      callSupport: 'समर्थन कॉल करें',
      emailSupport: 'ईमेल समर्थन',
      liveChat: 'लाइव चैट',
      tutorials: 'वीडियो ट्यूटोरियल',
      documentation: 'दस्तावेज़',
      userGuide: 'उपयोगकर्ता गाइड'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  const quickHelpOptions = [
    { icon: Phone, title: t.callSupport, description: '+91 1800 123 4567', action: 'tel:+911800123456' },
    { icon: Mail, title: t.emailSupport, description: 'support@cropcare-ai.com', action: 'mailto:support@cropcare-ai.com' },
    { icon: MessageCircle, title: t.liveChat, description: 'Chat with our experts', action: '#' },
    { icon: Video, title: t.tutorials, description: 'Watch how-to videos', action: '#' },
    { icon: BookOpen, title: t.documentation, description: 'Read detailed guides', action: '#' },
    { icon: FileText, title: t.userGuide, description: 'Download user manual', action: '#' }
  ];

  const faqs = [
    {
      question: 'How do I upload an image for disease detection?',
      answer: 'Simply click on the upload area on the home page, select your crop leaf image, and our AI will analyze it for diseases. You can either take a photo directly or upload from your gallery.'
    },
    {
      question: 'What image formats are supported?',
      answer: 'We support JPG, PNG, and WEBP formats. Images should be clear and well-lit for best results. Maximum file size is 10MB.'
    },
    {
      question: 'How accurate is the disease detection?',
      answer: 'Our AI model has an accuracy rate of 94% based on thousands of crop images. However, we recommend consulting with agricultural experts for severe cases.'
    },
    {
      question: 'Can I use the app offline?',
      answer: 'Currently, the app requires an internet connection for AI analysis. We are working on offline capabilities for future versions.'
    },
    {
      question: 'Is the app free to use?',
      answer: 'Basic disease detection is free for all users. Premium features like detailed treatment plans and expert consultations require a subscription.'
    },
    {
      question: 'How do I change the language?',
      answer: 'You can change the language from the language selector that appears when you first visit the site, or contact support to reset your language preference.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-primary mb-4 flex items-center justify-center space-x-3">
            <HelpCircle className="w-8 h-8" />
            <span>{t.title}</span>
          </h1>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Quick Help Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">{t.quickHelp}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickHelpOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className="hover:shadow-medium transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Get Help
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">{t.faq}</h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>{t.contactSupport}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.name}</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t.email}</label>
                <Input type="email" placeholder="your.email@example.com" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">{t.subject}</label>
              <Input placeholder="Brief description of your issue" />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">{t.message}</label>
              <Textarea 
                placeholder="Describe your issue or question in detail..."
                className="min-h-[120px] resize-none"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>{t.sendMessage}</span>
              </Button>
              <Badge variant="secondary" className="self-start">
                We typically respond within 24 hours
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;