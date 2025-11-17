import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Plus, Clock, Heart, MessageCircle, 
  Share2, Bookmark, Search, Pin, Users,
  ArrowLeft, ThumbsUp, X, Tag, Loader
} from 'lucide-react';
import { communityAPI, CommunityPost, CommunityReply } from '../lib/api';

export default function CommunityHub() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  
  // Create post form
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'Discussions',
    tags: [] as string[],
    tagInput: ''
  });
  const [creatingPost, setCreatingPost] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [creatingReply, setCreatingReply] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/community');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !authLoading) {
      loadPosts();
    }
  }, [user, authLoading, selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    if (selectedPost) {
      loadReplies(selectedPost.id);
    }
  }, [selectedPost]);

  const loadPosts = async () => {
    if (!user || authLoading) return;
    setLoading(true);
    try {
      const fetchedPosts = await communityAPI.getPosts({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        sort_by: sortBy
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Set empty array on error to prevent infinite loading
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (postId: string) => {
    setLoadingReplies(true);
    try {
      const fetchedReplies = await communityAPI.getReplies(postId);
      setReplies(fetchedReplies);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setCreatingPost(true);
    try {
      const createdPost = await communityAPI.createPost({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
        tags: newPost.tags
      });
      
      // Add to posts list
      setPosts([createdPost, ...posts]);
      setShowCreatePost(false);
      setNewPost({ title: '', content: '', category: 'Discussions', tags: [], tagInput: '' });
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.detail || 'Failed to create post');
    } finally {
      setCreatingPost(false);
    }
  };

  const handleCreateReply = async () => {
    if (!selectedPost || !replyContent.trim()) {
      return;
    }

    setCreatingReply(true);
    try {
      const newReply = await communityAPI.createReply(selectedPost.id, replyContent.trim());
      setReplies([...replies, newReply]);
      setReplyContent('');
      
      // Update post replies count
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, replies_count: p.replies_count + 1 }
          : p
      ));
      if (selectedPost) {
        setSelectedPost({ ...selectedPost, replies_count: selectedPost.replies_count + 1 });
      }
    } catch (error: any) {
      console.error('Error creating reply:', error);
      alert(error.response?.data?.detail || 'Failed to create reply');
    } finally {
      setCreatingReply(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const result = await communityAPI.togglePostLike(postId);
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes_count: result.likes_count, user_liked: result.liked }
          : p
      ));
      if (selectedPost?.id === postId) {
        setSelectedPost({ ...selectedPost, likes_count: result.likes_count, user_liked: result.liked });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleReplyLike = async (replyId: string) => {
    try {
      const result = await communityAPI.toggleReplyLike(replyId);
      setReplies(replies.map(r => 
        r.id === replyId 
          ? { ...r, likes_count: result.likes_count, user_liked: result.liked }
          : r
      ));
    } catch (error) {
      console.error('Error toggling reply like:', error);
    }
  };

  const handleViewPost = async (post: CommunityPost) => {
    setSelectedPost(post);
  };

  const addTag = () => {
    if (newPost.tagInput.trim() && !newPost.tags.includes(newPost.tagInput.trim())) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, newPost.tagInput.trim()],
        tagInput: ''
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Show loading only if auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  // Show loading for posts only if we have no posts yet
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-white text-xl">Loading posts...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const categories = ['All', 'Announcements', 'Feature Requests', 'Bug Reports', 'Experiences', 'Tips & Tricks', 'Use Cases', 'Guides', 'Discussions'];

  // Post Detail View
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button
            onClick={() => {
              setSelectedPost(null);
              setReplies([]);
            }}
            className="mb-6 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </button>

          {/* Post Detail */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedPost.is_pinned && <Pin className="w-5 h-5 text-purple-400" />}
                {selectedPost.is_announcement && (
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                    Announcement
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full">
                  {selectedPost.category}
                </span>
              </div>
              {selectedPost.is_solved && (
                <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs font-medium rounded-full border border-green-600/50">
                  ✓ Solved
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">{selectedPost.title}</h1>
            
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
                  {selectedPost.author.username?.[0] || selectedPost.author.email[0].toUpperCase()}
                </div>
                <span className="text-white">{selectedPost.author.username || selectedPost.author.email.split('@')[0]}</span>
                {selectedPost.author.is_admin && (
                  <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded">Admin</span>
                )}
              </div>
              <span>•</span>
              <span>{formatTimeAgo(selectedPost.created_at)}</span>
              <span>•</span>
              <span>{selectedPost.views} views</span>
            </div>

            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{selectedPost.content}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-800/50 text-purple-400 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-gray-800">
              <button
                onClick={() => handleToggleLike(selectedPost.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedPost.user_liked
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${selectedPost.user_liked ? 'fill-current' : ''}`} />
                <span>{selectedPost.likes_count}</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-400 rounded-lg hover:bg-gray-800 transition-all">
                <MessageCircle className="w-4 h-4" />
                <span>{selectedPost.replies_count}</span>
              </button>
              <button
                onClick={() => toggleBookmark(selectedPost.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  bookmarkedPosts.has(selectedPost.id)
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarkedPosts.has(selectedPost.id) ? 'fill-current' : ''}`} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-400 rounded-lg hover:bg-gray-800 transition-all">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Replies Section */}
          <div className="space-y-4 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </h2>
            {loadingReplies ? (
              <div className="text-center py-8 text-gray-400">Loading replies...</div>
            ) : replies.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No replies yet. Be the first to reply!</div>
            ) : (
              replies.map(reply => (
                <div key={reply.id} className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {reply.author.username?.[0] || reply.author.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-semibold">{reply.author.username || reply.author.email.split('@')[0]}</span>
                        {reply.is_official && (
                          <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded">Official</span>
                        )}
                        <span className="text-gray-500 text-sm">• {formatTimeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed mb-4">{reply.content}</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleReplyLike(reply.id)}
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            reply.user_liked ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${reply.user_liked ? 'fill-current' : ''}`} />
                          <span>{reply.likes_count}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply Form */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Write a Reply</h3>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4"
              placeholder="Share your thoughts..."
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Be respectful and constructive
              </div>
              <button
                onClick={handleCreateReply}
                disabled={creatingReply || !replyContent.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingReply ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Reply'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Community Hub
              </h1>
              <p className="text-gray-400">Share experiences, get help, and shape ANDROAMA's future</p>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Post
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{posts.length}</div>
            <div className="text-sm text-gray-400">Total Posts</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {posts.reduce((sum, post) => sum + post.replies_count, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Replies</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {posts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {new Set(posts.map(p => p.author.id)).size}
            </div>
            <div className="text-sm text-gray-400">Active Members</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts, tags, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Post</h2>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter post title..."
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Write your post content..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newPost.tagInput}
                      onChange={(e) => setNewPost({ ...newPost, tagInput: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                    >
                      <Tag className="w-5 h-5" />
                    </button>
                  </div>
                  {newPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newPost.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm flex items-center gap-2"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-purple-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={creatingPost || !newPost.title.trim() || !newPost.content.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingPost ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No posts found. Be the first to create one!</p>
            </div>
          ) : (
            posts.map(post => (
              <div
                key={post.id}
                onClick={() => handleViewPost(post)}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-gray-700 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {post.is_pinned && <Pin className="w-5 h-5 text-purple-400" />}
                    {post.is_announcement && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                        Announcement
                      </span>
                    )}
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    {post.is_solved && (
                      <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs font-medium rounded-full border border-green-600/50">
                        ✓ Solved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(post.created_at)}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors">
                  {post.title}
                </h2>

                <p className="text-gray-400 mb-4 line-clamp-2">
                  {post.content.substring(0, 200)}...
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-800/50 text-purple-400 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-semibold">
                        {post.author.username?.[0] || post.author.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">{post.author.username || post.author.email.split('@')[0]}</div>
                        <div className="text-xs text-gray-400">{post.author.is_admin ? 'Admin' : 'Member'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
