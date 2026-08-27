import type { NextFunction, Request, Response } from "express"

type Role = "ADMIN" | "APP_USER"

export const checkRole = (roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user?.role as Role | undefined
        if (!userRole) return res.status(401).json({ message: "Unauthorized, Please Login" })
        if (!roles.includes(userRole)) return res.status(403).json({ message: "Permission denied" })
        return next()
    }
}
