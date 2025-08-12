import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Plus, Users, MapPin, Clock } from 'lucide-react';

const Community = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );

  const translations = {
    en: {
      title: 'Farmer Community',
      subtitle: 'Connect with fellow farmers, share experiences, and get help',
      shareExperience: 'Share Your Experience',
      writePost: 'Write your post...',
      postButton: 'Post',
      recentPosts: 'Recent Posts',
      likes: 'likes',
      comments: 'comments',
      solved: 'Solved',
      urgent: 'Urgent',
      question: 'Question',
      tip: 'Tip'
    },
    hi: {
      title: 'किसान समुदाय',
      subtitle: 'साथी किसानों से जुड़ें, अनुभव साझा करें और सहायता पाएं',
      shareExperience: 'अपना अनुभव साझा करें',
      writePost: 'अपनी पोस्ट लिखें...',
      postButton: 'पोस्ट करें',
      recentPosts: 'हाल की पोस्ट',
      likes: 'पसंद',
      comments: 'टिप्पणियां',
      solved: 'हल हो गया',
      urgent: 'जरूरी',
      question: 'प्रश्न',
      tip: 'सुझाव'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

  const posts = [
    {
      id: 1,
      author: 'राम कुमार',
      location: 'Punjab, India',
      timeAgo: '2 hours ago',
      content: 'मेरी गेहूं की फसल में पीले धब्बे आ रहे हैं। कोई सुझाव दे सकता है?',
      type: 'question',
      likes: 12,
      comments: 8,
      tags: ['wheat', 'disease', 'urgent']
    },
    {
      id: 2,
      author: 'Priya Sharma',
      location: 'Maharashtra, India',
      timeAgo: '5 hours ago',
      content: 'नीम का तेल टमाटर की फसल में बहुत फायदेमंद है। मैंने इसका उपयोग किया और बहुत अच्छे परिणाम मिले।',
      type: 'tip',
      likes: 25,
      comments: 15,
      tags: ['tomato', 'organic', 'neem-oil']
    },
    {
      id: 3,
      author: 'अजय पटेल',
      location: 'Gujarat, India',
      timeAgo: '1 day ago',
      content: 'धन्यवाद सभी को! आपके सुझावों से मेरी मक्का की फसल बच गई।',
      type: 'solved',
      likes: 18,
      comments: 6,
      tags: ['corn', 'solved', 'thanks']
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'destructive';
      case 'solved': return 'default';
      case 'question': return 'secondary';
      case 'tip': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'urgent': return t.urgent;
      case 'solved': return t.solved;
      case 'question': return t.question;
      case 'tip': return t.tip;
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4 flex items-center justify-center space-x-3">
            <Users className="w-8 h-8" />
            <span>{t.title}</span>
          </h1>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Share Experience Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>{t.shareExperience}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t.writePost}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Badge variant="outline">Question</Badge>
                <Badge variant="outline">Tip</Badge>
                <Badge variant="outline">Experience</Badge>
              </div>
              <Button>{t.postButton}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">{t.recentPosts}</h2>
          
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-medium transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {post.author.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{post.author}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{post.location}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getTypeColor(post.type)}>
                    {getTypeLabel(post.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">{post.content}</p>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes} {t.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments} {t.comments}</span>
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;