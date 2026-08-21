import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { MessageSquare, Trash2, Pencil, Reply, X } from "lucide-react";
import toast from "react-hot-toast";
import Rating from "./Rating";
import StarInput from "./StarInput";
import Spinner from "./Spinner";
import Field from "./Field";
import { formatDate } from "../utils/format";
import { useGetMeQuery } from "../store/api/authApi";
import {
  useGetProductCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../store/api/commentApi";
import { getApiError } from "../store/api/baseApi";

// Star breakdown bar — "5★ ████ 12"
function RatingBar({ star, count, total }) {
  const percent = total ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-6 text-slate-600">{star}★</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-8 text-right text-slate-500">{count}</span>
    </div>
  );
}

export default function CommentSection({ productId }) {
  const { data: user } = useGetMeQuery();
  const { data, isLoading, error } = useGetProductCommentsQuery({ productId, limit: 20 });
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const [rating, setRating] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { text: "" } });

  const comments = data?.data || [];
  const summary = data?.summary;

  // User ne pehle se rating di hai? To review form ki jagah "edit" ka rasta dete hain
  const myRatedComment = comments.find(
    (comment) => comment.user?._id === user?._id && comment.rating !== null
  );

  const onSubmit = async ({ text }) => {
    try {
      if (editing) {
        await updateComment({
          id: editing._id,
          product: productId,
          text,
          // Reply par rating nahi hoti — backend 400 deta hai
          ...(editing.parentComment ? {} : { rating: rating || null }),
        }).unwrap();
        toast.success("Comment updated");
      } else {
        await createComment({
          product: productId,
          text,
          ...(replyTo ? { parentComment: replyTo._id } : rating ? { rating } : {}),
        }).unwrap();
        toast.success(replyTo ? "Reply posted" : "Thanks for your feedback!");
      }

      reset({ text: "" });
      setRating(0);
      setReplyTo(null);
      setEditing(null);
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not post your comment"));
    }
  };

  const startEdit = (comment) => {
    setEditing(comment);
    setReplyTo(null);
    setRating(comment.rating || 0);
    reset({ text: comment.text });
  };

  const cancelForm = () => {
    setEditing(null);
    setReplyTo(null);
    setRating(0);
    reset({ text: "" });
  };

  const handleDelete = async (comment) => {
    if (!window.confirm("Delete this comment? Replies to it will be deleted too.")) return;

    try {
      await deleteComment({ id: comment._id, product: productId }).unwrap();
      toast.success("Comment deleted");
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not delete the comment"));
    }
  };

  if (isLoading) return <Spinner label="Loading reviews..." />;

  return (
    <section className="mt-12">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
        <MessageSquare className="h-5 w-5 text-brand-600" />
        Reviews & questions
      </h2>

      {error ? (
        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{getApiError(error)}</p>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">
                {(summary?.average || 0).toFixed(1)}
              </span>
              <span className="text-sm text-slate-500">/ 5</span>
            </div>
            <div className="mt-2">
              <Rating value={summary?.average} showValue={false} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {summary?.total || 0} rating{summary?.total === 1 ? "" : "s"}
            </p>

            <div className="mt-4 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar
                  key={star}
                  star={star}
                  count={summary?.breakdown?.[star] || 0}
                  total={summary?.total || 0}
                />
              ))}
            </div>
          </div>

          {user ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800">
                {editing ? "Edit your comment" : replyTo ? `Reply to ${replyTo.user?.name}` : "Write something"}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-3" noValidate>
                {/* Rating sirf top-level comment par — reply par backend allow nahi karta */}
                {!replyTo && !editing?.parentComment ? (
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Your rating {myRatedComment && !editing ? "(already rated)" : "(optional)"}
                    </span>
                    <StarInput
                      value={rating}
                      onChange={myRatedComment && !editing ? () => {} : setRating}
                      size={22}
                    />
                    {myRatedComment && !editing ? (
                      <p className="mt-1.5 text-xs text-slate-500">
                        You can only rate a product once —{" "}
                        <button
                          type="button"
                          onClick={() => startEdit(myRatedComment)}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          edit your review
                        </button>{" "}
                        instead.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <Field
                  as="textarea"
                  placeholder={replyTo ? "Write your reply..." : "Share your experience or ask a question..."}
                  error={errors.text}
                  {...register("text", {
                    required: "Please write something",
                    minLength: { value: 2, message: "That is too short" },
                    maxLength: { value: 1000, message: "Keep it under 1000 characters" },
                  })}
                />

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-slate-300"
                  >
                    {isCreating ? "Posting..." : editing ? "Save changes" : replyTo ? "Post reply" : "Post"}
                  </button>
                  {editing || replyTo ? (
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-sm text-slate-600">Log in to leave a review or ask a question.</p>
              <Link
                to="/login"
                className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Log in
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm text-slate-500">No reviews yet — be the first to write one.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => {
                const isMine = comment.user?._id === user?._id;

                return (
                  <li key={comment._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                          {comment.user?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {comment.user?.name || "Unknown"}
                            {isMine ? <span className="ml-2 text-xs font-normal text-brand-600">you</span> : null}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(comment.createdAt)}</p>
                        </div>
                      </div>

                      {comment.rating ? <Rating value={comment.rating} size={14} showValue={false} /> : null}
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{comment.text}</p>

                    <div className="mt-3 flex items-center gap-3 text-xs">
                      {user ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTo(comment);
                            setEditing(null);
                            reset({ text: "" });
                          }}
                          className="flex items-center gap-1 font-medium text-slate-500 transition hover:text-brand-600"
                        >
                          <Reply size={13} /> Reply
                        </button>
                      ) : null}

                      {isMine ? (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(comment)}
                            className="flex items-center gap-1 font-medium text-slate-500 transition hover:text-brand-600"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(comment)}
                            className="flex items-center gap-1 font-medium text-slate-500 transition hover:text-rose-600"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </>
                      ) : null}
                    </div>

                    {comment.replies?.length ? (
                      <ul className="mt-4 space-y-3 border-l-2 border-slate-100 pl-4">
                        {comment.replies.map((reply) => (
                          <li key={reply._id}>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-700">
                                {reply.user?.name || "Unknown"}
                                <span className="ml-2 font-normal text-slate-400">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </p>
                              {reply.user?._id === user?._id ? (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(reply)}
                                  className="text-slate-400 transition hover:text-rose-600"
                                  aria-label="Delete reply"
                                >
                                  <Trash2 size={12} />
                                </button>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{reply.text}</p>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
