import User, { IUser } from "../models/User"
import jwt from "jsonwebtoken"
import { Document, HydratedDocument } from "mongoose";
import { Request, Response, NextFunction } from "express";

const AuthHandlers = {
    verifySession: (req: Request, res: Response, next: NextFunction) => {

        const authToken = req?.headers?.authorization as string

        console.log({authToken})

        try {

            jwt.verify(authToken, process.env.SESSION_TOKEN_KEY || "session_secret")

            next()

        }
        catch(err) {

            console.log({err})

            res.status(500).json({
                correctSession: false,
                errorMessage: "Error with the session, log in again" + err
            })
        }

    },
    logIn: async (req: Request, res: Response) => {

        console.log({body: req.body})

        const email: string = req?.body?.email
        const password: string = req?.body?.password

        console.log({email, password})

        let user: HydratedDocument<IUser> | null = null

        try {

            user = await User.findOne({email})

        }
        catch(err) {

            return res.status(500).json({
                errorMessage: "Error consulting to the database"
            })

        }

        if(!user) {
        
            return res.status(400).json({
                errorMessage: "User doesn't exist."
            })

        }

        try {

            const decodedPassword = jwt.verify(user.password, process.env.PASSWORD_TOKEN_KEY || "password_secret", {
                ignoreExpiration: true,
            })

            if(decodedPassword !== password) {

                return res.status(400).json({
                    errorMessage: 'Bad password'
                })

            }

            res.status(200).json({
                sessionToken: jwt.sign({email, password}, process.env.SESSION_TOKEN_KEY || "session_secret", {
                    expiresIn: "240000"
                })
            })

        }
        catch(err) {

            res.status(500).json({
                errorMessage: "Error verifyin the password" + err
            })

        }


    },
    logOut: async (req: Request, res: Response) => {

    }
}

export default AuthHandlers