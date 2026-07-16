import { Request, Response, NextFunction } from 'express';
import { getUserById, updateUserProfile, getAllUsers, deleteUser, changePassword as changePasswordService } from '../services/user.service';
import { createAuditLog } from '../services/audit.service';
import { HTTP_STATUS } from '../constants/httpStatus';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const user = await getUserById(userId);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const updated = await updateUserProfile(userId, req.body);
    await createAuditLog(userId, 'USER_PROFILE_UPDATE', req.ip, req.headers['user-agent'] as string, 'User profile updated');
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const removeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await deleteUser(id as string);
    const adminId = (req as any).user.userId;
    await createAuditLog(adminId, 'ADMIN_USER_DELETE', req.ip, req.headers['user-agent'] as string, `Admin deleted user ${id}`);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;
    await changePasswordService(userId, currentPassword, newPassword);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
