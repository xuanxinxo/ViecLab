import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type SchemaType = z.ZodSchema<any>;

export const validateRequest = (schema: SchemaType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate only the body for now
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};
