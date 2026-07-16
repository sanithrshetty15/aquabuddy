export interface SubmitFeedbackDto {
  subject: string;
  message: string;
  rating?: number;
  category?: string;
}

export interface FeedbackResponseDto {
  id: string;
  userId: string;
  subject: string;
  message: string;
  rating?: number | null;
  category?: string | null;
  status: string;
  response?: string | null;
  respondedAt?: string | null;
  createdAt: string;
}

export function toFeedbackResponse(f: any): FeedbackResponseDto {
  return {
    id: f.id,
    userId: f.userId,
    subject: f.subject,
    message: f.message,
    rating: f.rating,
    category: f.category,
    status: f.status,
    response: f.response,
    respondedAt: f.respondedAt?.toISOString?.() || null,
    createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt,
  };
}
