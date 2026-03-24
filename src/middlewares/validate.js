import { z } from 'zod';
import { IdSchema } from './base.schema.js';

//  TODO: validate & otheres with .trim(), password fields with .trim and .toString()
export const validate = (schema) => (req, res, next) => {
    try {
        const validated = schema.parse({
            params: req.params,
            query: req.query,
            body: req.body
        });

      req.params = validated.params
      req.query = validated.query
      req.body = validated.body

    } catch (error) {
    return res.status(400).json(error.errors);
    }
}

export const GetSessionSchema = z.object({
  params: z.object({
    id: IdSchema,
  }),
});