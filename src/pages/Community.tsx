import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Plus, Users, MapPin, Clock } from 'lucide-react';
// Import backend API calls
import { getPosts, createPost, likePost, addComment } from '../api';

const Community = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en'
  );
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);

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
      tip: 'Tip',
      commentPlaceholder: 'Write a comment...',
      commentButton: 'Comment'
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
      tip: 'सुझाव',
      commentPlaceholder: 'टिप्पणी लिखें...',
      commentButton: 'टिप्पणी'
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations] || translations.en;

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

  // Fetch posts from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPosts();
        if (Array.isArray(data) && data.length) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            author: p.author || 'Farmer',
            location: p.location || '',
            timeAgo: p.time_ago || '',
            content: p.content,
            type: p.type || 'question',
            likes: p.likes || 0,
            comments: (p.comments && p.comments.length) || 0,
            tags: p.tags || []
          }));
          setPosts(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      }
    };
    fetchData();
  }, []);

  // Handle new post creation
  const handlePost = async () => {
    if (!newPost.trim()) return;
    setLoading(true);
    try {
      const newPostData = {
        title: 'Untitled',
        content: newPost,
        author: 'Anonymous'
      };
      const created = await createPost(newPostData);
      setPosts([created, ...posts]);
      setNewPost('');
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle like
  const handleLike = async (postId: number) => {
    try {
      await likePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  // Handle add comment
  const handleAddComment = async (postId: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      await addComment(postId, { content: text });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Failed to add comment:', err);
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
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Badge variant="outline">Question</Badge>
                <Badge variant="outline">Tip</Badge>
                <Badge variant="outline">Experience</Badge>
              </div>
              <Button onClick={handlePost} disabled={loading}>
                {loading ? 'Posting...' : t.postButton}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">{t.recentPosts}</h2>

          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {post.author?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{post.author || 'Unknown'}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{post.location || 'Unknown location'}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{post.timeAgo || ''}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={getTypeColor(post.type || 'question')}>
                      {getTypeLabel(post.type || 'question')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed">{post.content}</p>

                  {post.tags && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Like / Comment buttons */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2"
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className="w-4 h-4" />
                        <span>{post.likes || 0} {t.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments || 0} {t.comments}</span>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Add Comment Input */}
                  <div className="mt-2 flex items-center space-x-2">
                    <Input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder={t.commentPlaceholder}
                      className="flex-grow"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}
                    >
                      {t.commentButton}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No posts available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
