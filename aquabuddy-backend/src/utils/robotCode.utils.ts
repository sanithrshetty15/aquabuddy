import { ROBOT_CODE_PREFIX } from './constants';

export const generateRobotCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${ROBOT_CODE_PREFIX}-${randomPart}`;
};
