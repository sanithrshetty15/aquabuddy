import { Request, Response, NextFunction } from 'express';
import * as featureFlagService from '../services/featureFlag.service';
import { extractPagination } from '../utils/pagination.utils';
import { toFeatureFlagResponse } from '../dtos';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const listFlags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = extractPagination(req);
    const result = await featureFlagService.getAllFlags(pagination);
    res.json(StandardApiResponseDto.paginated(result.items.map(toFeatureFlagResponse), result.pagination));
  } catch (error) {
    next(error);
  }
};

export const getEnabledFlags = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await featureFlagService.getEnabledFlags();
    res.json(StandardApiResponseDto.ok(flags.map(toFeatureFlagResponse)));
  } catch (error) {
    next(error);
  }
};

export const getFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flag = await featureFlagService.getFlagByKey(req.params.key as string);
    res.json(StandardApiResponseDto.ok(toFeatureFlagResponse(flag)));
  } catch (error) {
    next(error);
  }
};

export const createFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flag = await featureFlagService.createFlag(req.body);
    res.status(201).json(StandardApiResponseDto.created(toFeatureFlagResponse(flag)));
  } catch (error) {
    next(error);
  }
};

export const updateFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flag = await featureFlagService.updateFlag(req.params.key as string, req.body);
    res.json(StandardApiResponseDto.ok(toFeatureFlagResponse(flag)));
  } catch (error) {
    next(error);
  }
};

export const toggleFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enabled } = req.body;
    const flag = await featureFlagService.toggleFlag(req.params.key as string, enabled);
    res.json(StandardApiResponseDto.ok(toFeatureFlagResponse(flag)));
  } catch (error) {
    next(error);
  }
};

export const deleteFlag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await featureFlagService.deleteFlag(req.params.key as string);
    res.json(StandardApiResponseDto.ok(null, 'Feature flag deleted'));
  } catch (error) {
    next(error);
  }
};
