const requests = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  userId: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = requests.get(userId)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs
    requests.set(userId, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
