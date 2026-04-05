import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Plus, Heart, Image, X } from 'lucide-react';

const ExplorePage = () => {
  const { user, userId } = useUser();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    caption: '',
    mealName: '',
    calories: '',
    image: null,
    imagePreview: null,
  });
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost({
          ...newPost,
          image: file,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.imagePreview || !newPost.mealName) {
      console.warn('❌ Validation failed - Missing image or meal name');
      alert('Please select an image and enter a meal name');
      return;
    }

    setIsPosting(true);
    console.log('✅ Post validation passed');
    console.log('📝 Post data:', {
      userId,
      userName: user?.profile?.name || 'Anonymous',
      mealName: newPost.mealName,
      caption: newPost.caption,
      calories: newPost.calories,
    });

    try {
      const requestBody = {
        userId,
        userName: user?.profile?.name || 'Anonymous',
        mealName: newPost.mealName,
        caption: newPost.caption,
        calories: newPost.calories ? parseInt(newPost.calories) : null,
        imageData: newPost.imagePreview,
      };

      console.log('📤 Sending POST to http://localhost:5001/api/posts');
      const response = await fetch('http://localhost:5001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response received - Status:', response.status);
      const data = await response.json();
      console.log('Response body:', data);

      if (response.ok) {
        console.log('✅ Success! Post created');
        setPosts([data.post, ...posts]);
        setNewPost({ caption: '', mealName: '', calories: '', image: null, imagePreview: null });
        setShowCreatePost(false);
        alert('Meal shared successfully!');
      } else {
        console.error('❌ Server error:', data);
        alert(`Error: ${data.error || 'Failed to create post'}`);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error.message);
      alert(`Error: ${error.message}\n\nMake sure the backend is running on http://localhost:5001`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, likes: data.likes, isLiked: data.isLiked } : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page">
      <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>🍽️ Community Meals</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>Discover healthy meals from others</p>
        {userId && (
          <button className="btn btn-primary" onClick={() => setShowCreatePost(true)}>
            <Plus size={20} /> Share Your Meal
          </button>
        )}
      </div>

      {showCreatePost && (
        <div className="explore-modal-overlay" onClick={() => setShowCreatePost(false)}>
          <div className="explore-modal" onClick={(e) => e.stopPropagation()}>
            <div className="explore-modal-header">
              <h2>Share Your Meal</h2>
              <button className="explore-close-btn" onClick={() => setShowCreatePost(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="explore-image-upload">
                {newPost.imagePreview ? (
                  <div className="explore-image-preview">
                    <img src={newPost.imagePreview} alt="Preview" />
                    <button type="button" className="explore-remove-image" onClick={() => setNewPost({ ...newPost, image: null, imagePreview: null })}><X size={20} /></button>
                  </div>
                ) : (
                  <label className="upload-area">
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                    <Image size={48} />
                    <p>Click to upload a photo</p>
                  </label>
                )}
              </div>
              <div className="explore-form-group">
                <label>Meal Name *</label>
                <input type="text" className="explore-input" value={newPost.mealName} onChange={(e) => setNewPost({ ...newPost, mealName: e.target.value })} placeholder="e.g., Grilled Chicken Salad" required />
              </div>
              <div className="explore-form-group">
                <label>Calories (optional)</label>
                <input type="number" className="explore-input" value={newPost.calories} onChange={(e) => setNewPost({ ...newPost, calories: e.target.value })} placeholder="e.g., 450" />
              </div>
              <div className="explore-form-group">
                <label>Caption</label>
                <textarea className="explore-input" value={newPost.caption} onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })} placeholder="Share your thoughts..." rows={3} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!newPost.imagePreview || !newPost.mealName || isPosting}>{isPosting ? 'Posting...' : 'Share'}</button>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Image size={64} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No posts yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Be the first to share your meal!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="card explore-post-card">
            <div className="explore-post-header">
              <div className="explore-avatar">{post.userName?.charAt(0).toUpperCase() || 'A'}</div>
              <div className="explore-post-info">
                <span className="explore-user-name">{post.userName || 'Anonymous'}</span>
                <span className="explore-post-time">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
            {post.imageData && <div className="explore-post-image"><img src={post.imageData} alt={post.mealName} /></div>}
            <div className="explore-post-actions">
              <button className={`explore-like-btn ${post.isLiked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                <Heart size={22} fill={post.isLiked ? 'currentColor' : 'none'} />
                <span>{post.likes || 0}</span>
              </button>
            </div>
            <div className="explore-post-content">
              <h3 className="explore-meal-name">{post.mealName}</h3>
              {post.calories && <span className="explore-calorie-badge">{post.calories} cal</span>}
              {post.caption && <p className="explore-caption">{post.caption}</p>}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ExplorePage;
