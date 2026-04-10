import express from "express";

const userRoutes = express.Router();


// TO DO validate data, check auth
userRoutes.get('', getAllUsersController);
userRoutes.get('/:id', getUserController);
userRoutes.delete('/:id', deleteUserController);

userRoutes.post('', (re, res) => {});
export default userRoutes;