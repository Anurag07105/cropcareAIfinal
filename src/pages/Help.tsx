import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Send, Phone, Mail, MessageCircle, BookOpen, Video, FileText } from 'lucide-react';
import { getQuickHelp, getFAQs, contactSupport } from '@/api';

const Help = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );
  const [quickHelpOptions, setQuickHelpOptions] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

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

  // Fetch Quick Help & FAQs from backend
  useEffect(() => {
    (async () => {
      try {
        const quickHelpData = await getQuickHelp();
        setQuickHelpOptions(quickHelpData || []);
      } catch (err) {
        console.error('Failed to load quick help:', err);
      }
    })();
    (async () => {
      try {
        const faqData = await getFAQs();
        setFaqs(faqData || []);
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      }
    })();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return;
    setLoading(true);
    try {
      await contactSupport(formData);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

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
              const IconComp = 
                option.title?.includes(t.callSupport) ? Phone :
                option.title?.includes(t.emailSupport) ? Mail :
                option.title?.includes(t.liveChat) ? MessageCircle :
                option.title?.includes(t.tutorials) ? Video :
                option.title?.includes(t.documentation) ? BookOpen :
                option.title?.includes(t.userGuide) ? FileText :
                HelpCircle;
              return (
                <Card key={index} className="hover:shadow-medium transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComp className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{option.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(option.action, '_blank')}>
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
                <Input 
                  placeholder="Your name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t.email}</label>
                <Input 
                  type="email" 
                  placeholder="your.email@example.com"
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">{t.subject}</label>
              <Input 
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">{t.message}</label>
              <Textarea 
                placeholder="Describe your issue or question in detail..."
                className="min-h-[120px] resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex items-center space-x-2" onClick={handleSubmit} disabled={loading}>
                <Send className="w-4 h-4" />
                <span>{loading ? 'Sending...' : t.sendMessage}</span>
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
