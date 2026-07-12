import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Users,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  LogOut,
} from "lucide-react";
import {
  getPosts,
  createPost,
  likePost,
  addComment,
  getComments,
  getLikedPosts,
} from "../api";
import { useAuth } from "@/contexts/AuthContext";

const Community = () => {
  const { user, signOut } = useAuth();
  const [selectedLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [commentInputs, setCommentInputs] = useState<{
    [key: number]: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set()
  );
  const [postComments, setPostComments] = useState<{ [key: number]: any[] }>(
    {}
  );

  const translations = {
    en: {
      title: "Farmer Community",
      subtitle: "Connect with fellow farmers, share experiences, and get help",
      shareExperience: "Share Your Experience",
      writePost: "Write your post...",
      postButton: "Post",
      recentPosts: "Recent Posts",
      likes: "likes",
      comments: "comments",
      commentPlaceholder: "Write a comment...",
      commentButton: "Comment",
      showComments: "Show comments",
      hideComments: "Hide comments",
    },
    hi: {
      title: "किसान समुदाय",
      subtitle:
        "साथी किसानों से जुड़ें, अनुभव साझा करें और सहायता पाएं",
      shareExperience: "अपना अनुभव साझा करें",
      writePost: "अपनी पोस्ट लिखें...",
      postButton: "पोस्ट करें",
      recentPosts: "हाल की पोस्ट",
      likes: "पसंद",
      comments: "टिप्पणियां",
      commentPlaceholder: "टिप्पणी लिखें...",
      commentButton: "टिप्पणी",
      showComments: "टिप्पणियां दिखाएं",
      hideComments: "टिप्पणियां छिपाएं",
    },
  };

  const t =
    translations[selectedLanguage as keyof typeof translations] ||
    translations.en;

  // Fetch posts and liked status on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, likedIds] = await Promise.all([
          getPosts(),
          getLikedPosts(),
        ]);
        if (Array.isArray(postsData)) {
          setPosts(
            postsData.map((p: any) => ({
              id: p.id,
              author: p.author || "Farmer",
              location: p.location || "",
              timeAgo: p.time_ago || "",
              content: p.content,
              type: p.type || "question",
              likes: p.likes || 0,
              commentCount: p.comment_count || 0,
              tags: p.tags || [],
            }))
          );
        }
        if (Array.isArray(likedIds)) {
          setLikedPostIds(new Set(likedIds));
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };
    fetchData();
  }, []);

  // Create a new post
  const handlePost = async () => {
    if (!newPost.trim()) return;
    setLoading(true);
    try {
      const created = await createPost({ content: newPost });
      setPosts([
        {
          id: created.id,
          author: user?.user_metadata?.name || user?.email || "You",
          content: created.content,
          likes: 0,
          commentCount: 0,
          type: "question",
          tags: [],
        },
        ...posts,
      ]);
      setNewPost("");
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle like (one per user per post)
  const handleLike = async (postId: number) => {
    try {
      const result = await likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: result.likes } : p
        )
      );
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        if (result.liked) {
          next.add(postId);
        } else {
          next.delete(postId);
        }
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Toggle comment section visibility + fetch comments
  const toggleComments = async (postId: number) => {
    const next = new Set(expandedComments);
    if (next.has(postId)) {
      next.delete(postId);
    } else {
      next.add(postId);
      // Fetch comments if not already loaded
      if (!postComments[postId]) {
        try {
          const comments = await getComments(postId);
          setPostComments((prev) => ({ ...prev, [postId]: comments }));
        } catch (err) {
          console.error("Failed to fetch comments:", err);
        }
      }
    }
    setExpandedComments(next);
  };

  // Add a comment
  const handleAddComment = async (postId: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const newComment = await addComment(postId, { content: text });
      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, commentCount: (p.commentCount || 0) + 1 }
            : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      // Ensure comments section is expanded after posting
      setExpandedComments((prev) => new Set(prev).add(postId));
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={selectedLanguage} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center space-x-3">
              <Users className="w-8 h-8" />
              <span>{t.title}</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
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
            <div className="flex justify-end">
              <Button onClick={handlePost} disabled={loading}>
                {loading ? "Posting..." : t.postButton}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">
            {t.recentPosts}
          </h2>

          {posts.length > 0 ? (
            posts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-medium transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {post.author?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {post.author || "Unknown"}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        {post.location && (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span>{post.location}</span>
                          </>
                        )}
                        {post.timeAgo && (
                          <>
                            <Clock className="w-3 h-3 ml-2" />
                            <span>{post.timeAgo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed">
                    {post.content}
                  </p>

                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
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
                        className={`flex items-center space-x-2 ${
                          likedPostIds.has(post.id)
                            ? "text-red-500"
                            : ""
                        }`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            likedPostIds.has(post.id) ? "fill-current" : ""
                          }`}
                        />
                        <span>
                          {post.likes || 0} {t.likes}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2"
                        onClick={() => toggleComments(post.id)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          {post.commentCount || 0} {t.comments}
                        </span>
                        {expandedComments.has(post.id) ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Comments section (expandable) */}
                  {expandedComments.has(post.id) && (
                    <div className="space-y-3 pl-4 border-l-2 border-muted">
                      {(postComments[post.id] || []).map(
                        (c: any, idx: number) => (
                          <div
                            key={c.id || idx}
                            className="bg-muted/50 rounded-md p-3"
                          >
                            <p className="text-sm text-foreground">
                              {c.comment}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              User #{c.user_id}
                            </span>
                          </div>
                        )
                      )}
                      {(postComments[post.id] || []).length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No comments yet. Be the first!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Add Comment Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder={t.commentPlaceholder}
                      className="flex-grow"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddComment(post.id)
                      }
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
