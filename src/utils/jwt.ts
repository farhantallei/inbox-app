import * as jose from "jose"

interface SignOptions {
  /**
   * Signature algorithm. Could be one of these values :
   * - HS256:    HMAC using SHA-256 hash algorithm (default)
   * - HS384:    HMAC using SHA-384 hash algorithm
   * - HS512:    HMAC using SHA-512 hash algorithm
   * - RS256:    RSASSA using SHA-256 hash algorithm
   * - RS384:    RSASSA using SHA-384 hash algorithm
   * - RS512:    RSASSA using SHA-512 hash algorithm
   * - ES256:    ECDSA using P-256 curve and SHA-256 hash algorithm
   * - ES384:    ECDSA using P-384 curve and SHA-384 hash algorithm
   * - ES512:    ECDSA using P-521 curve and SHA-512 hash algorithm
   * - none:     No digital signature or MAC value included
   */
  algorithm?: Algorithm | undefined
  // keyid?: string | undefined;
  /** expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
  expiresIn?: string | number | undefined
  /** expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).  Eg: 60, "2 days", "10h", "7d" */
  // notBefore?: string | number | undefined;
  // audience?: string | string[] | undefined;
  // subject?: string | undefined;
  // issuer?: string | undefined;
  // jwtid?: string | undefined;
  // mutatePayload?: boolean | undefined;
  // noTimestamp?: boolean | undefined;
  // header?: JwtHeader | undefined;
  // encoding?: string | undefined;
  // allowInsecureKeySizes?: boolean | undefined;
  // allowInvalidAsymmetricKeyTypes?: boolean | undefined;
}

// interface JwtHeader {
//   alg: string | Algorithm;
//   typ?: string | undefined;
//   cty?: string | undefined;
//   crit?: Array<string | Exclude<keyof JwtHeader, 'crit'>> | undefined;
//   kid?: string | undefined;
//   jku?: string | undefined;
//   x5u?: string | string[] | undefined;
//   'x5t#S256'?: string | undefined;
//   x5t?: string | undefined;
//   x5c?: string | string[] | undefined;
// }

type Algorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512"
  | "none"

function sign(payload: jose.JWTPayload, key: string, options?: SignOptions) {
  const sign_jwt = new jose.SignJWT(payload)

  const secretKey = new TextEncoder().encode(key)

  sign_jwt.setProtectedHeader({ alg: options?.algorithm || "HS256" })
  if (options?.expiresIn != null) sign_jwt.setExpirationTime(options.expiresIn)

  return sign_jwt.sign(secretKey)
}

async function verify<T extends {}>(token: string, key: string) {
  const secretKey = new TextEncoder().encode(key)
  const value = await jose.jwtVerify(token, secretKey)
  return value.payload as T & jose.JWTPayload
}

function decode<T extends {}>(token: string) {
  return jose.decodeJwt(token) as T & jose.JWTPayload
}

const jwt = { sign, verify, decode }
export default jwt
