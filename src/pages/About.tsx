import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Linkedin, Twitter, Award, Users, Target, Heart } from 'lucide-react';

const About = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );

  const translations = {
    en: {
      title: 'About CropCare AI',
      mission: 'Our Mission',
      missionText: 'To empower farmers worldwide with AI-driven crop disease detection technology, helping them protect their crops and increase agricultural productivity.',
      team: 'Our Team',
      contact: 'Contact Information',
      businessEmail: 'Business Email',
      businessContact: 'Business Contact',
      address: 'Address',
      achievements: 'Our Achievements',
      farmers: 'Farmers Helped',
      diseases: 'Diseases Detected',
      accuracy: 'Detection Accuracy',
      getInTouch: 'Get in Touch',
      followUs: 'Follow Us'
    },
    hi: {
      title: 'क्रॉपकेयर AI के बारे में',
      mission: 'हमारा मिशन',
      missionText: 'AI-संचालित फसल रोग पहचान तकनीक के साथ दुनियाभर के किसानों को सशक्त बनाना, उनकी फसलों की सुरक्षा में मदद करना और कृषि उत्पादकता बढ़ाना।',
      team: 'हमारी टीम',
      contact: 'संपर्क जानकारी',
      businessEmail: 'व्यावसायिक ईमेल',
      businessContact: 'व्यावसायिक संपर्क',
      address: 'पता',
      achievements: 'हमारी उपलब्धियां',
      farmers: 'किसानों की मदद की',
      diseases: 'रोग का पता लगाया',
      accuracy: 'पहचान की सटीकता',
      getInTouch: 'संपर्क करें',
      followUs: 'हमें फॉलो करें'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  const teamMembers = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Founder & CEO',
      specialty: 'Agricultural Technology',
      experience: '15+ years in AgriTech'
    },
    {
      name: 'Priya Sharma',
      role: 'Chief Technology Officer',
      specialty: 'AI/ML Engineering',
      experience: '12+ years in AI'
    },
    {
      name: 'Arjun Patel',
      role: 'Head of Agriculture',
      specialty: 'Crop Science',
      experience: '20+ years in Agriculture'
    }
  ];

  const achievements = [
    { icon: Users, number: '50,000+', label: t.farmers },
    { icon: Target, number: '200+', label: t.diseases },
    { icon: Award, number: '94%', label: t.accuracy }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-6">{t.title}</h1>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Heart className="w-6 h-6 text-primary" />
              <span>{t.mission}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t.missionText}
            </p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {achievement.number}
                  </div>
                  <p className="text-muted-foreground">{achievement.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Team Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">{t.team}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center space-y-3">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.specialty}</p>
                    <p className="text-xs text-muted-foreground">{member.experience}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t.contact}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{t.businessEmail}</p>
                  <p className="text-muted-foreground">contact@cropcare-ai.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{t.businessContact}</p>
                  <p className="text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{t.address}</p>
                  <p className="text-muted-foreground">
                    AgriTech Hub, Sector 18<br />
                    Gurugram, Haryana 122015<br />
                    India
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t.getInTouch}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Have questions or want to collaborate? We'd love to hear from you!
              </p>
              
              <Button className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              
              <Separator />
              
              <div>
                <p className="font-medium mb-3">{t.followUs}</p>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Twitter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;