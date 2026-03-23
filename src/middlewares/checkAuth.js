import { verifyUserToken } from "../utils/jwt.js";
import createError from "http-errors";

//  TODO: validate & otheres with .trim(), password fields with .trim and .toString()

export function checkAuth(re, res, next) {
    if (!re.headers.authorization) {
        throw createError(401, "No access token provided");
    } else {
        // get the token only at position 1 split by space
        const access_token = re.headers.authorization.split(' ')[1];

        try {
            // verify with jwt
            const decode = verifyUserToken(access_token, process.env.SECRET_KEY);
            // save decoded data as user payload in re.userPayload to be sent to next step
            re.userPayload = decode;
            next();
        } catch (error) {
            throw createError(403, "Invalid credentials");
        }
    }
}

export function checkResetToken(re, res, next) {
    const reset_token = re.params.token;
    try {
        // check that token is valid in jwt
        const decode = verifyUserToken(reset_token, process.env.RESET_KEY); 
        
        // create a new key in re object to be sent to next step
        re.userPayload = decode;
        // if yes next
        next();
    } catch (error) {
        throw createError(403, "Invalid credentials");
    }
}