import { useState } from 'react'
import { Comment } from '../types/index'

export function CommentsSection({
  comments = [],
  onAddComment,
  isLoading = false
}: {
  comments?: Comment[]
  onAddComment: (text: string) => void
  isLoading?: boolean
}) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <div
              key={comment.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {comment.createdBy}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 break-words">
                {comment.text}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
            No comments yet
          </p>
        )}
      </div>

      {/* Add Comment */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={isSubmitting || isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting || isLoading}
            className="w-full px-3 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
          >
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </div>
    </div>
  )
}
