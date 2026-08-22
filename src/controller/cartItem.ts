import type { Request, Response } from "express";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { broadcastMessage } from "../utility/websock";

export const createCartItem= async(req:Request, res:Response)=>{
    try {
        const {prodId, qty}= req.body

        if(!prodId || !qty) return res.status(400).json({message: "All Field Required"});

        const createCart = await prisma.cartItem.create({
            data:{
                userId: (req as any).user.id,
                productId: prodId,
                quantity: qty

            }
        })

        logger.info("CartItem Created")
        broadcastMessage({event: "create:cartItem", data:createCart})

    } catch (error) {
        logger.error(`Error:${error}`)
    }
}

export const delCartItem =  async(req:Request, res:Response)=>{
    try {
        const {id}= req.body

        const delCart = prisma.cartItem.delete({
            where:{id}
        })

        logger.info("CartItem Deleted")
        res.status(200).json({message: "Deleted Successful"})
        
    } catch (error) {
        logger.error(`Error:${error}`)
    }
} 

export const getCartItem =  async(req:Request, res:Response)=>{
    try {

        const page = Math.max(1, Number((req.query.page as string)) || 1);
        const limit = Math.max(1, Number((req.query.limit as string))|| 10);
        
        const skip = (page-1)*limit;
    
                const [getAllCart, totalCart] = await Promise.all([ prisma.cartItem.findMany({
                    skip,
                    take: limit,
                   where:{
                    userId: (req as any).user.id
                   },
                   include:{
                    product: true
                   }
                }), prisma.cartItem.count({where:{userId: (req as any).user.id}})])
        
                const totalPage = Math.ceil(totalCart / limit);
        
                logger.info("Delete Product")
                res.status(200).json({
                    getAllCart,
                    totalPage,
                    skip,
                    hasNextPage: page < totalPage,
                    hasPrevPage: page > 1
                })
        
    } catch (error) {
        logger.error(`Error:${error}`)
    }
}