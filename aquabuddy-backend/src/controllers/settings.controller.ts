import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';
import { toUserSettingsResponse, toPlatformSettingResponse } from '../dtos';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const getUserSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const settings = await settingsService.getUserSettings(userId);
    res.json(StandardApiResponseDto.ok(toUserSettingsResponse(settings)));
  } catch (error) {
    next(error);
  }
};

export const updateUserSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const settings = await settingsService.updateUserSettings(userId, req.body);
    res.json(StandardApiResponseDto.ok(toUserSettingsResponse(settings)));
  } catch (error) {
    next(error);
  }
};

export const getPlatformSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getAllPlatformSettings(true);
    res.json(StandardApiResponseDto.ok(settings.map(toPlatformSettingResponse)));
  } catch (error) {
    next(error);
  }
};

export const getPublicSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getAllPlatformSettings(false);
    res.json(StandardApiResponseDto.ok(settings.map(toPlatformSettingResponse)));
  } catch (error) {
    next(error);
  }
};

export const getPlatformSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingsService.getPlatformSetting(req.params.key as string);
    res.json(StandardApiResponseDto.ok(toPlatformSettingResponse(setting)));
  } catch (error) {
    next(error);
  }
};

export const updatePlatformSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingsService.updatePlatformSetting(req.params.key as string, req.body);
    res.json(StandardApiResponseDto.ok(toPlatformSettingResponse(setting)));
  } catch (error) {
    next(error);
  }
};

export const createPlatformSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await settingsService.createPlatformSetting(req.body);
    res.status(201).json(StandardApiResponseDto.created(toPlatformSettingResponse(setting)));
  } catch (error) {
    next(error);
  }
};

export const deletePlatformSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await settingsService.deletePlatformSetting(req.params.key as string);
    res.json(StandardApiResponseDto.ok(null, 'Platform setting deleted'));
  } catch (error) {
    next(error);
  }
};
