import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Eye, EyeOff, Smartphone } from 'lucide-react';
import { sendOtp, verifyOtp, signupEmail, signupPhone } from '../api'; // ✅ Import all 4

const Login = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

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
      otpPlaceholder: 'Enter OTP',
      sendOtp: 'Send OTP',
      verifyOtp: 'Verify OTP',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
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
      otpPlaceholder: 'OTP दर्ज करें',
      sendOtp: 'OTP भेजें',
      verifyOtp: 'OTP सत्यापित करें',
      signIn: 'साइन इन',
      signUp: 'साइन अप',
      forgotPassword: 'पासवर्ड भूल गए?',
      noAccount: 'खाता नहीं है?',
      orContinueWith: 'या इसके साथ जारी रखें',
      googleSignIn: 'गूगल',
      recommended: 'किसानों के लिए अनुशंसित'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  // ✅ Handle phone signup or login via OTP
  const handleSendOtp = async () => {
    try {
      const res = await sendOtp({ phone_number: phoneNumber });
      if (res.message) {
        setOtpSent(true);
        alert(res.message);
      } else {
        alert(res.detail || 'Failed to send OTP');
      }
    } catch (err) {
      alert('Error sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await verifyOtp({ phone_number: phoneNumber, otp_code: otp });
      if (res.id) {
        alert('OTP verified successfully!');
      } else {
        alert(res.detail || 'OTP verification failed');
      }
    } catch {
      alert('Error verifying OTP');
    }
  };

  // ✅ Handle email signup (instead of just login)
  const handleEmailSignup = async () => {
    try {
      const res = await signupEmail({ name: 'User', email, password });
      if (res.id) {
        alert('Signed up successfully!');
      } else {
        alert(res.detail || 'Signup failed');
      }
    } catch {
      alert('Error signing up');
    }
  };

  // ✅ Handle phone signup (alternative to sendOtp auto-register)
  const handlePhoneSignup = async () => {
    try {
      const res = await signupPhone({ name: 'User', phone_number: phoneNumber });
      if (res.id) {
        alert('Phone signup successful!');
      } else {
        alert(res.detail || 'Signup failed');
      }
    } catch {
      alert('Error signing up');
    }
  };

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
                <TabsTrigger value="phone">{t.phoneLogin}</TabsTrigger>
                <TabsTrigger value="email">{t.emailLogin}</TabsTrigger>
              </TabsList>

              {/* PHONE LOGIN */}
              <TabsContent value="phone" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t.phoneNumber}</label>
                  <Input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                {!otpSent ? (
                  <>
                    <Button className="w-full" onClick={handleSendOtp}>
                      {t.sendOtp}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handlePhoneSignup}>
                      {t.signUp}
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder={t.otpPlaceholder}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleVerifyOtp}>
                      {t.verifyOtp}
                    </Button>
                  </>
                )}
              </TabsContent>

              {/* EMAIL LOGIN / SIGNUP */}
              <TabsContent value="email" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t.email}</label>
                  <Input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t.password}</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                <Button className="w-full" onClick={handleEmailSignup}>
                  {t.signUp}
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
              <Button variant="outline" className="w-full mt-4">
                {t.googleSignIn}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
