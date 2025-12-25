const rateLimits = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5

export function checkRateLimit(userId: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  const userLimit = rateLimits.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    const remainingTime = Math.ceil((userLimit.resetTime - now) / 1000)
    return { allowed: false, remainingTime }
  }
  
  userLimit.count++
  return { allowed: true }
}

export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [userId, limit] of rateLimits.entries()) {
    if (now > limit.resetTime) {
      rateLimits.delete(userId)
    }
  }
}

setInterval(cleanupRateLimits, 5 * 60 * 1000)
