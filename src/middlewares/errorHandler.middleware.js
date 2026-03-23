// special error handler middleware with error 1st argument
// have to have total arg 4
export default function errorHandler(err, re, res, next) {
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || "Internal server error"
    })
}