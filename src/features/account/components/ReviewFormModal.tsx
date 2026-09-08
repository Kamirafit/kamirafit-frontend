"use client";

import { useState } from "react";
import Image from "next/image";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import Button from "@/components/ui/Button";

type ReviewSubmitData = {
  orderId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  date: string;
};

type Props = {
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  onClose: () => void;
  onSubmit: (review: ReviewSubmitData) => void;
  isSubmitting?: boolean;
};

export default function ReviewFormModal({ orderId, productId, productName, productImage, onClose, onSubmit, isSubmitting = false }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const validProductImage = getValidImageSrc(productImage, DEFAULT_PRODUCT_IMAGE);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      
      const newUrls = newFiles.map(f => URL.createObjectURL(f));
      setImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a rating");
    if (!comment.trim()) return alert("Please write a review comment");

    onSubmit({
      orderId,
      productId,
      rating,
      title,
      comment,
      images: imageUrls, // In a real app, upload files first and pass URLs
      date: new Date().toISOString(),
    });
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto modal-scrollbar-hidden rounded-2xl border border-line bg-ink shadow-2xl backdrop-blur-xl">
        <div className="sticky top-0 z-10 border-b border-line bg-ink/95 px-6 py-4 backdrop-blur-md flex justify-between items-center">
          <h2 className="font-display text-lg font-bold text-paper">
            Rate & Review Product
          </h2>
          <button
            onClick={isSubmitting ? undefined : onClose}
            disabled={isSubmitting}
            className="text-paper-muted hover:text-paper disabled:opacity-40"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex gap-4 items-center bg-ink-2 p-3 rounded-xl border border-line">
            <div className="relative h-16 w-16 overflow-hidden rounded-md border border-line">
              <Image src={validProductImage} alt={productName} fill className="object-cover" />
            </div>
            <p className="font-display text-sm font-medium text-paper">{productName}</p>
          </div>

          <div className="flex flex-col items-center gap-2 py-2">
            <label className="text-[12px] font-medium text-paper-muted uppercase tracking-wider">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill={(hoverRating || rating) >= star ? "#EAB308" : "none"}
                    stroke={(hoverRating || rating) >= star ? "#EAB308" : "currentColor"}
                    className={(hoverRating || rating) >= star ? "" : "text-paper-muted"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Review Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Review Comment</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How did it fit?"
              className="rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-gold resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-paper-muted uppercase tracking-wider">Add Photos (Optional)</label>
            
            <div className="mt-2 flex flex-wrap gap-3">
              {imageUrls.map((url, i) => {
                const previewSrc = getValidImageSrc(url, DEFAULT_PRODUCT_IMAGE);
                return (
                  <div key={url + i} className="relative h-20 w-20 rounded-lg border border-line overflow-hidden group">
                    <Image src={previewSrc} alt={`preview ${i}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
              
              {imageUrls.length < 4 && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line bg-ink-2 text-paper-muted transition-colors hover:border-gold hover:bg-gold/5 hover:text-gold">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-[10px] font-medium uppercase">Upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-line pt-6">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
