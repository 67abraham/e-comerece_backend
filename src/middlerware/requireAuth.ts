import type { NextFunction, Request, Response } from "express";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async(req:Request, res:Response, next:NextFunction)=>{
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })

        if(!session?.session || !session.user) return res.status(401).json({message: "Unauthorized, Please Login"});

        (req as any).user = session.user;
        (req as any).session = session.session

        return next();
        
    } catch (error) {
        console.log(error) 
    }
}