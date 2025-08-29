import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number;      // Max requests per windowMs
  message?: string;
}

const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};

export const rateLimit = (options: RateLimitOptions) => {
  const windowMs = options.windowMs ?? 15 * 60 * 1000;
  const max = options.max ?? 100;
  const message = options.message ?? 'Too many requests, please try again later';

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Initialize or reset the request count for this IP
    if (!rateLimitStore[ip] || rateLimitStore[ip].resetTime <= windowStart) {
      rateLimitStore[ip] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment the request count
    rateLimitStore[ip].count++;

    // Check if the request limit has been exceeded
    if (rateLimitStore[ip].count > max) {
      const retryAfter = Math.ceil((rateLimitStore[ip].resetTime - now) / 1000);

      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', rateLimitStore[ip].resetTime.toString());

      return res.status(429).json({
        success: false,
        message,
        retryAfter: `${retryAfter} seconds`,
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', (max - rateLimitStore[ip].count).toString());
    res.setHeader('X-RateLimit-Reset', rateLimitStore[ip].resetTime.toString());

    // Call next() to continue to the next middleware/route handler
    return next();
  };
};

// Specific rate limiters for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
});
