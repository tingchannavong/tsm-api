import jwt from "jsonwebtoken";

export function generateToken(payload, secretKey, time) {
   
    const token = jwt.sign(payload, secretKey, {
        algorithm: "HS256",
        expiresIn: time
    });

    return token;
}

export function verifyUserToken(token, secretKey) { 
    const decode = jwt.verify(token, secretKey, {
    algorithms: ["HS256"]
    });

    return decode;
}