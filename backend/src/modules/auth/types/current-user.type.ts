import { Types } from 'mongoose';
export type CurrentUserType = {
  sub: string;
  email: string;
  roleId: Types.ObjectId | string;
};
