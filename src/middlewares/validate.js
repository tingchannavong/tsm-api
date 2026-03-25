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
    if (validated.query) req.query = validated.query;
    if (validated.body) req.body = validated.body;

    next();
  } catch (error) {
    // console.log(error.flatten().fieldErrors);
    next(createError(400, `${error.issues[0].message} of ${error.issues[0].path}`));
  }
};
