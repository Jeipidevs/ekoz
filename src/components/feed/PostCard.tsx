import React, { useState } from 'react';
import { Post } from '../../types';
import { useEkoz } from '../../context/EkozContext';
import {
  Heart,
  MessageSquare,
  Share2,
  Pin,
  CheckCircle2,
  Send,
  MessageCircle,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { toggleLikePost, addComment, openChatWith, user } = useEkoz();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
  };

  const isAuthor = post.author.id === user.id;

  return (
    <article className={`ekoz-card post-card ${post.pinned ? 'post-pinned' : ''}`}>
      {post.pinned && (
        <div className="pinned-header-badge">
          <Pin size={14} className="pin-icon" />
          <span>COMUNICADO FIXADO PELA LIDERANÇA</span>
        </div>
      )}

      {/* Post Author Header */}
      <div className="post-header">
        <div className="post-author-group">
          <div className="avatar-wrapper">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="author-avatar-img"
            />
            {post.author.verified && (
              <span className="verified-check" title="Membro Verificado">
                <CheckCircle2 size={13} />
              </span>
            )}
          </div>
          <div className="author-meta">
            <div className="author-name-row">
              <span className="author-name">{post.author.name}</span>
              <span className="badge badge-gold" style={{ fontSize: '0.66rem', padding: '0.1rem 0.4rem' }}>
                {post.author.role}
              </span>
            </div>
            <span className="author-headline">{post.author.headline}</span>
            <div className="post-meta-details">
              <span className="post-timestamp">{post.timestamp}</span>
              <span className="meta-separator">•</span>
              <span className="badge badge-moss" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                {post.category}
              </span>
            </div>
          </div>
        </div>

        {!isAuthor && (
          <button
            onClick={() => openChatWith(post.author)}
            className="btn btn-secondary btn-sm post-connect-btn"
            title={`Conversar com ${post.author.name}`}
          >
            <MessageCircle size={14} />
            <span className="hide-mobile">Mensagem</span>
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="post-body">
        {post.content.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="post-paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Optional Media */}
      {post.mediaUrl && (
        <div className="post-media-container">
          <img src={post.mediaUrl} alt="Mídia do post" className="post-media-img" />
        </div>
      )}

      {/* Post Actions Bar */}
      <div className="post-actions-bar">
        <button
          onClick={() => toggleLikePost(post.id)}
          className={`post-action-btn ${post.userLiked ? 'liked' : ''}`}
        >
          <Heart size={18} fill={post.userLiked ? '#DFC16E' : 'none'} color={post.userLiked ? '#DFC16E' : 'currentColor'} />
          <span>{post.likesCount}</span>
          <span className="hide-mobile">Recomendar</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="post-action-btn"
        >
          <MessageSquare size={18} />
          <span>{post.comments.length}</span>
          <span className="hide-mobile">Comentários</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            alert('Link copiado para a área de transferência!');
          }}
          className="post-action-btn"
        >
          <Share2 size={18} />
          <span className="hide-mobile">Compartilhar</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-drawer">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <img src={user.avatar} alt={user.name} className="comment-my-avatar" />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva uma reflexão ou contribuição construtiva..."
              className="ekoz-input comment-input"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="btn btn-gold btn-sm"
            >
              <Send size={13} />
            </button>
          </form>

          {post.comments.length > 0 ? (
            <div className="comments-list">
              {post.comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="comment-avatar"
                  />
                  <div className="comment-bubble">
                    <div className="comment-header">
                      <span className="comment-author-name">{comment.author.name}</span>
                      <span className="comment-time">{comment.timestamp}</span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments-text">Seja o primeiro a interagir com esta publicação.</p>
          )}
        </div>
      )}
    </article>
  );
};
