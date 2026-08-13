import "@/styles/Reviews.css";
import { useNavigate } from "react-router-dom";
import PATHS from "@/routes/paths";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import useReviews from "../hooks/useReviews";
import useReviewActions from "../hooks/useReviewActions";
import { ReviewCardSkeleton, ReviewSummarySkeleton } from "@/components/skeleton";

const StarBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="star-bar">
      <span className="star-bar__label">{label} ⭐</span>
      <div className="star-bar__track">
        <div className="star-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="star-bar__count">{count}</span>
    </div>
  );
};

const ReviewList = ({ productId, currentUser }) => {
  const { reviews, loading, error, refetchReviews } = useReviews(productId);
  const { submitting, actionError, createReview, editReview, removeReview } =
    useReviewActions(refetchReviews);

  const navigate = useNavigate();

  const userReview = currentUser
    ? reviews.find((review) => review.userId === currentUser.id)
    : null;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
  }));

  const shouldShowCreateForm = Boolean(currentUser) && !userReview && !loading && !error;
  const shouldShowLoginPrompt = !currentUser && !loading && !error;

  return (
    <section className="review-section" aria-label="Customer reviews">
      <h2 className="review-section__title">
        Customer Reviews
      </h2>

      {loading && (
        <div className="review-loading">
          <ReviewSummarySkeleton />
          <div style={{ marginTop: 24 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <ReviewCardSkeleton key={index} />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <p className="review-error">Could not load reviews: {error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="review-empty">
          <span className="review-empty__icon">Reviews</span>
          <p className="review-empty__title">No reviews yet</p>
          <p className="review-empty__sub">Be the first to share your thoughts.</p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="review-summary">
          <div className="review-summary__score">
            <span className="review-summary__avg">{avgRating.toFixed(1)}</span>
            <div className="review-summary__stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    color: star <= Math.round(avgRating) ? "#e77600" : "#ddd",
                    fontSize: "1.4rem",
                  }}
                >
                  {"★"}
                </span>
              ))}
            </div>
            <span className="review-summary__total">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
          <div className="review-summary__bars">
            {distribution.map(({ star, count }) => (
              <StarBar key={star} label={star} count={count} total={reviews.length} />
            ))}
          </div>
        </div>
      )}

      {shouldShowCreateForm && (
        <ReviewForm
          productId={productId}
          onSubmit={createReview}
          submitting={submitting}
          actionError={actionError}
        />
      )}

      {shouldShowLoginPrompt && (
        <div className="review-login-prompt">
          <p style={{ margin: 0, marginBottom: 16, color: 'var(--text-secondary)' }}>
            Have this product?{' '}
            <a
              href={PATHS.LOGIN}
              onClick={(event) => {
                event.preventDefault();
                navigate(PATHS.LOGIN);
              }}
              style={{
                color: 'var(--accent, #ff9f00)',
                fontWeight: 700,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Log in
            </a>{' '}
            to share your review.
          </p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="sk-loaded">
          <ul className="review-list" role="list">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard
                  review={review}
                  currentUserId={currentUser?.id ?? null}
                  onEdit={editReview}
                  onDelete={removeReview}
                  submitting={submitting}
                  actionError={actionError}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ReviewList;
