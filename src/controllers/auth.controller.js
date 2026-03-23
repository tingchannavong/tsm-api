import { createUser, findUserById, findUserByPhone, findUserByUsername, updatePasswordById, verifyUserAuth } from "../services/auth.services.js";
import { generateToken } from "../utils/jwt.js";
import createError from "http-errors";
import "dotenv/config";


export async function register(re, res) {
    const {username, password, phone, email, firstname, lastname, role} = re.body;
    
    const userData = {username, password, phone, email, firstname, lastname, role}

    const userExist = await findUserByUsername(username);

    // check if username alrd exist in db
    if (userExist) {
          return res.status(400).json({message: "username already exists. please try another one."});
    } else {
         const user = await createUser(userData);
        return res.status(201).json({message: "user added successfully", user});
    }
}

export async function login(re, res) {
    const {username, password} = re.body;

    const user =  await verifyUserAuth(username, password);
    console.log(user);
    if (user) {
        const { role, id} = user;
        const payload = { username, role, id };
        const access_token = generateToken(payload, process.env.SECRET_KEY, "1h"); 

        res.status(200).json({message: "log in success", access_token});
    } else if (user === null) {
        throw createError(400, "username does not exist");
        // res.status(400).json({message: "username does not exist"})
    } else {
        res.status(401).json({message: "incorrect password"})
    }
}

export async function getUserData(re, res) {
    const {id, role, username} = re.userPayload;

    // get data from backend service
    const userData = await findUserById(id);
    // console.log(userData);
    
    // send json out
    res.json({
        message: 'verify success',
        email: userData.email,
        username,
        id,
        role
    });
}

export async function checkUser(re, res) {
  
    const {phone} = re.body;

    const user = await findUserByPhone(phone);
    console.log(user);
    // check if phone exist
    if (user) {
        console.log('this user phone exist, creating reset token');
        const payload = {phone, id: user.id}
        // call jwt function to create token
        const resetToken = generateToken(payload, process.env.RESET_KEY, "10m");
        // set token and id in token table bonus extra security
        const result = await createTokenIdentity(resetToken, user.id);
        console.log(result);
        // create reset link
        const resetLink = `/auth/reset-password/${resetToken}`;
        // send resetLink to front end 
        // which front end need to use the exact same at path for react router to link to page
        // front end makes page  for click in real life
        return res.json({resetToken, resetLink});
    } else if (user === null ) {
        throw createError(401, "phone number does not exist in our system");
    }
}

export async function resetPassword(re, res) {
   const newPassword = re.body.password;
    
   const id = Number(re.userPayload.id)
    // todo: check that identity exists 

    // if yes, hash the new password and save to db
    const userData = await updatePasswordById(id, newPassword);
    
    // todo: clear token data table where id

    res.json({
        message: "update password success!",
        userData
    })
}

// bonus save reset token in db
    // then delete it after pw changed to prevent double use how?
    // create database reset_token + id
    // where reset_token, if exist, can update password
    // patch update successfully
    // delete all tokens where userid