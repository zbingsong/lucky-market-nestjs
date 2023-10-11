/**
 * Information that will be encoded in JWT token
 * This information will be extracted in JwtGuard by passport-jwt
 */
export interface JwtPayload {
  sessionId: string;
}
