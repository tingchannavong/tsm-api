import createError from "http-errors";

// middleware to handle all incoming validations
export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      params: req.params,
      query: req.query,
      body: req.body,
    });

    if (validated.params) req.params = validated.params;
    if (validated.query) Object.assign(req.query, validated.query);
    if (validated.body) req.body = validated.body;

    next();
  } catch (error) {
    // console.log(error.flatten().fieldErrors);
    // Show zod error message
    if (error.issues && error.issues.length > 0) {
      next(createError(400, `${error.issues[0].message} at ${error.issues[0].path}`));
    }
    
    next(error);
  }
};
