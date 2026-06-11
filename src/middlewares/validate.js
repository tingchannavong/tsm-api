import createError from "http-errors";

// middleware to handle all incoming validations
export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      params: req.params,
      query: req.query,
      body: req.body,
    });

    if (validated.params) Object.assign(req.params, validated.params);
    if (validated.body) Object.assign(req.body, validated.body);

    req.validated = validated;

    next();
  } catch (error) {

    // Show zod error message
    if (error.issues && error.issues.length > 0) {
      console.log('we 1')
      next(
        createError(
          400,
          `${error.issues[0].message} at ${error.issues[0].path}`,
        ),
      );
    }

    // if (error.flatten) {
    //   console.log('we 2')
    //   const fieldErrors = error.flatten().fieldErrors;
      
    //   return next(
    //     createError(400, "Validation Failed", { 
    //       errors: fieldErrors 
    //     })
    //   );
    // }
   
    next(error);
  }
};
