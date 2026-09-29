import React, { useState } from 'react'
import {
  ThumbsUp,
  MessageCircle,
  Flag,
  PlusCircle,
  Send,
  MapPin,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useCommunityPosts,
  useUpvoteCommunityPost,
  useReportCommunityPost,
  useCommunityComments,
  useCreateCommunityComment,
} from '@/lib/api/supportCommunity'
import { useAuth } from '@/context/AuthContext'
import { CreatePostModal } from './CreatePostModal'
import type { CommunityPost } from '@/lib/data/seedSupportCommunity'

interface PostCardProps {
  post: CommunityPost
  isDark: boolean
}

const PostCommentsThread: React.FC<{ postId: string }> = ({ postId }) => {
  const { data: comments = [], isLoading } = useCommunityComments(postId)
  const createComment = useCreateCommunityComment()
  const [commentText, setCommentText] = useState('')

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const txt = commentText.trim()
    setCommentText('')
    await createComment.mutateAsync({ postId, comment: txt })
  }

  return (
    <div className="pt-3 border-t border-[var(--line)] space-y-3 animate-in fade-in duration-150">
      {isLoading ? (
        <div className="text-[11px] text-[var(--muted)]">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-[11px] text-[var(--muted)] italic">
          No comments yet. Be the first farmer to share thoughts!
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {comments.map((c) => (
            <div
              key={c.id}
              className="p-2.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--line)] text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--ink)]">{c.author_name}</span>
                <span className="text-[10px] text-[var(--muted)]">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[var(--ink)]/80 text-[11px] leading-relaxed">{c.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment or question..."
          className="flex-1 px-3 py-1.5 rounded-full bg-[var(--bg-page)] border border-[var(--line)] text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--forest)]"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={createComment.isPending || !commentText.trim()}
          className="rounded-full px-3 py-1 text-xs"
        >
          <Send className="w-3 h-3" />
        </Button>
      </form>
    </div>
  )
}

const PostCard: React.FC<PostCardProps> = ({ post, isDark }) => {
  const { user } = useAuth()
  const upvotePost = useUpvoteCommunityPost()
  const reportPost = useReportCommunityPost()

  const [showComments, setShowComments] = useState(false)
  const isUpvoted = user?.id ? post.upvoted_by.includes(user.id) : false
  const isReported = user?.id ? post.reported_by.includes(user.id) : false

  const handleUpvote = () => {
    upvotePost.mutate(post.id)
  }

  const handleReport = () => {
    if (confirm('Report this post for inappropriate content?')) {
      reportPost.mutate(post.id)
    }
  }

  return (
    <div
      className={`p-6 rounded-3xl border transition-all duration-200 space-y-4 ${
        isDark
          ? 'bg-[var(--ink)] border-[var(--line)] text-white'
          : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)]'
      }`}
    >
      {/* Author and Tag */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{post.author_name}</span>
            <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-white/60' : 'text-[var(--muted)]'}`}>
              <MapPin className="w-3 h-3" />
              {post.author_district}
            </span>
          </div>
          <span className={`text-[10px] ${isDark ? 'text-white/50' : 'text-[var(--muted)]'}`}>
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
            isDark
              ? 'bg-white/10 text-[var(--lime)] border border-white/10'
              : 'bg-[var(--surface-alt)] text-[var(--forest)] border border-[var(--line)]'
          }`}
        >
          <Tag className="w-3 h-3" />
          {post.crop_tag}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h4 className="text-base sm:text-lg font-black tracking-tight">{post.title}</h4>
        <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-[var(--ink)]/80'}`}>
          {post.content}
        </p>

        {/* Photo */}
        {post.photos && post.photos.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden mt-3 h-48 sm:h-64 bg-black/10">
            <img
              src={post.photos[0]}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className={`pt-3 border-t flex items-center justify-between text-xs ${isDark ? 'border-white/10' : 'border-[var(--line)]'}`}>
        <div className="flex items-center gap-2">
          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              isUpvoted
                ? 'bg-[var(--lime)] text-[var(--forest-dark)] shadow-sm'
                : isDark
                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{post.upvotes_count} Upvotes</span>
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              showComments
                ? 'bg-[var(--forest)] text-white'
                : isDark
                ? 'bg-white/10 text-white/80 hover:bg-white/20'
                : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.comments_count} Comments</span>
          </button>
        </div>

        {/* Report Button */}
        <button
          onClick={handleReport}
          title="Report this post"
          disabled={isReported}
          className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
            isReported
              ? 'text-[var(--danger)] font-bold'
              : isDark
              ? 'text-white/40 hover:text-[var(--danger)]'
              : 'text-[var(--muted)] hover:text-[var(--danger)]'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>{isReported ? 'Reported' : 'Report'}</span>
        </button>
      </div>

      {/* Collapsible Comments Section */}
      {showComments && <PostCommentsThread postId={post.id} />}
    </div>
  )
}

export const CommunityFeed: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data: posts = [], isLoading } = useCommunityPosts(
    selectedCrop === 'all' ? undefined : selectedCrop
  )

  const crops = ['all', 'Wheat HD-3086', 'Mustard Pusa Bold', 'Paddy Basmati 1121']

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-[var(--ink)] shrink-0">Filter Crop:</span>
          {crops.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shrink-0 cursor-pointer transition-all ${
                selectedCrop === c
                  ? 'bg-[var(--forest)] text-white shadow-sm'
                  : 'bg-[var(--surface-alt)] text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {c === 'all' ? 'All Discussions' : c}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 text-xs py-2"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Share Experience</span>
        </Button>
      </div>

      {/* Feed List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-[var(--muted)]">
          Loading community feed...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
          <MessageCircle className="w-12 h-12 text-[var(--muted)] mx-auto mb-3" />
          <h4 className="text-base font-bold text-[var(--ink)]">No Community Posts Found</h4>
          <p className="text-xs text-[var(--muted)] mt-1">
            Be the first farmer to share tips or insights for this crop!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, idx) => (
            <PostCard key={post.id} post={post} isDark={idx % 2 === 1} />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
