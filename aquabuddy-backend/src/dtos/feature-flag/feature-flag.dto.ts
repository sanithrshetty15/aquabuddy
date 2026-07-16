export interface CreateFeatureFlagDto {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  conditions?: Record<string, any>;
}

export interface UpdateFeatureFlagDto {
  enabled?: boolean;
  name?: string;
  description?: string;
  conditions?: Record<string, any>;
}

export interface FeatureFlagResponseDto {
  key: string;
  enabled: boolean;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toFeatureFlagResponse(f: any): FeatureFlagResponseDto {
  return {
    key: f.key,
    enabled: f.enabled,
    name: f.name,
    description: f.description,
    createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt,
    updatedAt: f.updatedAt instanceof Date ? f.updatedAt.toISOString() : f.updatedAt,
  };
}
