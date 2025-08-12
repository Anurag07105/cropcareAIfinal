import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Eye, EyeOff, Smartphone, User } from 'lucide-react';

const Login = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const translations = {
    en: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your CropCare AI account',
      phoneLogin: 'Phone Login',
      emailLogin: 'Email Login',
      phoneNumber: 'Phone Number',
      phonePlaceholder: 'Enter your phone number',
      email: 'Email Address',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      sendOtp: 'Send OTP',
      signIn: 'Sign In',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      orContinueWith: 'Or continue with',
      googleSignIn: 'Google',
      recommended: 'Recommended for farmers'
    },
    hi: {
      title: 'वापस स्वागत है',
      subtitle: 'अपने क्रॉपकेयर AI खाते में साइन इन करें',
      phoneLogin: 'फोन लॉगिन',
      emailLogin: 'ईमेल लॉगिन',
      phoneNumber: 'फोन नंबर',
      phonePlaceholder: 'अपना फोन नंबर दर्ज करें',
      email: 'ईमेल पता',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      password: 'पासवर्ड',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      sendOtp: 'OTP भेजें',
      signIn: 'साइन इन',
      forgotPassword: 'पासवर्ड भूल गए?',
      noAccount: 'खाता नहीं है?',
      signUp: 'साइन अप',
      orContinueWith: 'या इसके साथ जारी रखें',
      googleSignIn: 'गूगल',
      recommended: 'किसानों के लिए अनुशंसित'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <Card className="w-full max-w-md shadow-strong">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-primary">{t.title}</CardTitle>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="phone" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{t.phoneLogin}</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{t.emailLogin}</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Phone Login */}
              <TabsContent value="phone" className="space-y-4">
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-2 text-sm text-primary">
                    <Smartphone className="w-4 h-4" />
                    <span>{t.recommended}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.phoneNumber}</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      +91
                    </div>
                    <Input
                      type="tel"
                      placeholder={t.phonePlaceholder}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                </div>
                
                <Button className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  {t.sendOtp}
                </Button>
              </TabsContent>
              
              {/* Email Login */}
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.email}</label>
                  <Input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.password}</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="text-right">
                  <Button variant="link" className="p-0 h-auto text-sm">
                    {t.forgotPassword}
                  </Button>
                </div>
                
                <Button className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  {t.signIn}
                </Button>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t.orContinueWith}
                  </span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4" size="lg">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t.googleSignIn}
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <span className="text-muted-foreground text-sm">{t.noAccount} </span>
              <Button variant="link" className="p-0 h-auto text-sm">
                {t.signUp}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;