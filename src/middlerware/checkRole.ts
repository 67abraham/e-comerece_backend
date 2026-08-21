import type { NextFunction, Request, Response } from "express"
import { auth } from "../../lib/auth"
import { fromNodeHeaders } from "better-auth/node"


type Role = "ADMIN" | "APP_USER"
export const checkRole =(role:Role[])=>{
    return async(req:Request, res:Response, next:NextFunction)=>{

        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })

        const userRole = session?.user.role as any
        console.log(session?.user.role)
        if(role.includes(userRole)) return next();

        res.status(401).json({message:"Permission Denial"})

    }
}