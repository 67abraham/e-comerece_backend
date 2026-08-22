import type { Request, Response } from "express";
import { logger } from "../../lib/logger";

export const createOrder = async(req:Request, res:Response)=>{
    try {
        
        
    } catch (error) {
        logger.error(`Error: ${error}`)
    }
}