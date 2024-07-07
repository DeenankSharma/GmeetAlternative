
import bcrypt from 'bcryptjs';
import User from "../models/user.model";
import generateTokenAndSetCookie from '../utils/generateToken';
import {Request, Response } from 'express';

export const signUp = async (req:Request,res:Response) => {
    try {
        const {fullName, username , password, confirmPassword} = req.body;

        if(password !== confirmPassword) {
            return res.status(400).json({
                error: "Passwords do not match"
            })
        }

        const user = await User.findOne({username}); //this will check if user with username exists in db or not

        if(user) {
            return res.status(400).json({
                error: "User already exists"
            })
        }

        //Hash the password here 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); 
        //https://avatar-placeholder.iran.liara.run/ => for avatars
        
        

        const newUser = new User({
            fullName,
            username,
            password: hashedPassword,
            
        })

        if(newUser){
            //Generate JWT Token here 
            generateTokenAndSetCookie(newUser._id , res);

            await newUser.save();

        res.status(201).json({
            _id : newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            
        })
        }else{
            res.status(500).json({error:"Invalid user data"});
        }

    } catch (error:any) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({error:"Internal server error"}); 
    }
}

export const login = async (req:Request,res:Response) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if(!user ||!isPasswordCorrect) {
            return res.status(400).json({
                error: "Invalid username or password "
            })
        } 

        const token=generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            token:token,
            _id : user._id,
            fullName: user.fullName,
            username: user.username,
            
        });
    } catch (error:any) {
        console.log("Error in login controller", error.message);
        res.status(500).json({error:"Internal server error"}); 
    }
}

export const logout = (req:Request,res:Response) => {
    try {
        res.cookie("jwt", "" , {maxAge:0});
        res.status(200).json({
            message: "Logged out successfully"
        })
    } catch (error:any) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({error:"Internal server error"}); 
    }
}
