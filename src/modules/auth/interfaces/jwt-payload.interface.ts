export interface JwtAccessPayload {
  sub: string; // accountId
  username: string;
  roleId: string;
  roleName: string;
}
