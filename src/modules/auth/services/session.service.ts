export function isSessionValid(iat: number, updatedAt: Date): boolean {
  // If the token was issued before the user was last updated, it's invalid.
  // iat is in seconds, updatedAt is a Date object.
  const issuedAtDate = new Date(iat * 1000);
  
  // Allow a small buffer (e.g., 5 seconds) to handle slight timing discrepancies
  return issuedAtDate.getTime() + 5000 >= updatedAt.getTime();
}
