/* eslint-disable */
export interface JwtPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  tokenVersion: number;
}

export interface JwtUser extends JwtPayload {
  id: string;
  _id: string;
  roles: string[];
}
