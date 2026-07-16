export interface RevenueResponseDto {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: string;
  referenceId?: string | null;
  referenceType?: string | null;
  date: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RevenueSummaryDto {
  total: number;
  count: number;
  byType: Record<string, number>;
}

export function toRevenueResponse(r: any): RevenueResponseDto {
  return {
    id: r.id,
    type: r.type,
    description: r.description,
    amount: r.amount,
    currency: r.currency,
    referenceId: r.referenceId,
    referenceType: r.referenceType,
    date: r.date instanceof Date ? r.date.toISOString() : r.date,
    metadata: r.metadata || {},
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}
