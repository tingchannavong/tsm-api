import { verifyUserToken } from "../utils/jwt.js";
import createError from "http-errors";

export function checkAuth(req, res, next) {
    if (!req.headers.authorization) {
        throw createError(401, "No access token provided");
    } else {
        // get the token only at position 1 split by space
        const access_token = req.headers.authorization.split(' ')[1];

        try {
            // verify with jwt
            const decode = verifyUserToken(access_token, process.env.SECRET_KEY);
            // console.log('decode', decode);
            // save decoded data as user payload in re.userPayload to be sent to next step
            req.userPayload = decode;
            next();
        } catch (error) {
            return next(createError(401, "Invalid token"))
        }
    }
}

export function checkResetToken(req, res, next) {
    const reset_token = req.params.token;
    // console.log('re at check reset token', reset_token)
    try {
        // check that token is valid in jwt
        const decode = verifyUserToken(reset_token, process.env.RESET_KEY); 
        
        // create a new key in re object to be sent to next step
        req.userPayload = decode;
        // console.log('decode', decode)
        // if yes next
        next();
    } catch (error) {
        throw createError(403, "Invalid/expired credentials");
    }
}