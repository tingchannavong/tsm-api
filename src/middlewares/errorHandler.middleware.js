import pkg from '@prisma/client';

const { Prisma } = pkg;

// special error handler middleware with error 1st argument
// have to have total arg 4
export default function errorHandler(err, re, res, next) {
  console.dir(err)
  const status = err.status || 500;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const uniqueConstraintRegex = /_(\w*)_key/;
    const match = err.message.match(uniqueConstraintRegex);

    if (match) {
      const field = match[1];
      return res.status(status).json({
        success: false,
        message: `${field} is already taken.`,
      });
    }
  }

  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
}
