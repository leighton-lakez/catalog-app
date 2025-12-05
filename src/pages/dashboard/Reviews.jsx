import { useState } from 'react'
import { useReviews } from '../../hooks/useReviews'
import { formatDate } from '../../lib/utils'
import Button from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import {
  StarIcon,
  CheckIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export default function Reviews() {
  const { reviews, loading, approveReview, deleteReview } = useReviews()
  const [filter, setFilter] = useState('all') // all, pending, approved

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.is_approved
    if (filter === 'approved') return review.is_approved
    return true
  })

  const pendingCount = reviews.filter(r => !r.is_approved).length

  const handleApprove = async (reviewId) => {
    try {
      await approveReview(reviewId)
    } catch (error) {
      console.error('Error approving review:', error)
      alert('Failed to approve review')
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await deleteReview(reviewId)
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? (
            <StarIconSolid key={star} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={star} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
          <p className="text-gray-500 mt-1">
            Manage customer reviews for your products
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                {pendingCount} pending approval
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Approved ({reviews.length - pendingCount})
        </button>
      </div>

      {filteredReviews.length === 0 ? (
        <EmptyState
          icon={ChatBubbleLeftRightIcon}
          title={filter === 'all' ? 'No reviews yet' : `No ${filter} reviews`}
          description={
            filter === 'all'
              ? "When customers leave reviews, they'll appear here for you to manage."
              : `There are no ${filter} reviews at the moment.`
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-xl border p-5 ${
                !review.is_approved ? 'border-yellow-200 bg-yellow-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Product image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {review.products?.image_url ? (
                      <img
                        src={review.products.image_url}
                        alt={review.products.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {renderStars(review.rating)}
                      {!review.is_approved && (
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">
                          Pending Approval
                        </span>
                      )}
                      {review.is_verified_purchase && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      <span className="font-medium text-gray-900">{review.customer_name}</span>
                      {' · '}
                      <span>{review.products?.name}</span>
                      {' · '}
                      <span>{formatDate(review.created_at)}</span>
                    </p>

                    {review.title && (
                      <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                    )}

                    {review.review && (
                      <p className="text-gray-700">{review.review}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!review.is_approved && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
