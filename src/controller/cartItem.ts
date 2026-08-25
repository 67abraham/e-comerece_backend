import type { Request, Response } from "express";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { broadcastMessage } from "../utility/websock";

export const createCartItem= async(req:Request, res:Response)=>{
    try {
        const {productId, quantity}= req.body

        if(!productId || !quantity) return res.status(400).json({message: "All Field Required"});

        const createCart = await prisma.cartItem.create({
            data:{
                userId: (req as any).user.id,
                productId,
                quantity

            }
        })

        logger.info("CartItem Created")
        broadcastMessage({event: "create:cartItem", data:createCart})
        //remove later 
        res.status(201).json(createCart)

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
        res.status(200).send("Deleted Successful")
        
    } catch (error) {
        logger.error(`Error:${error}`)
    }
} 

export const getCartItem =  async(req:Request, res:Response)=>{
    try {

        const page = Math.max(1, Number((req.query.page as string)) || 1);
        const limit = Math.max(1, Number((req.query.limit as string))|| 10);
        
        const skip = (page-1)*limit;
    
                const [getAllCart, totalCart, billingAddress] = await Promise.all([ prisma.cartItem.findMany({
                    skip,
                    take: limit,
                   where:{
                    userId: (req as any).user.id,
                    ordered: false
                    
                   },
                   include:{
                    product:{
                        select:{
                            name:true,
                            imageUrl:true,
                            price:true,
                            description:true,
                            
                        }
                    }
                   }
                }), prisma.cartItem.count({where:{userId: (req as any).user.id}}),
                prisma.billingInfo.findMany({
                    where:{userId:(req as any).user.id}
                })
            ])

                const totalPrice = getAllCart.reduce((sum, item)=> sum + (item.product.price * item.quantity), 0)
                const totalPage = Math.ceil(totalCart / limit);
        
                logger.info("Get Product")
                res.status(200).json({
                    getAllCart,
                    totalPrice,
                    totalPage,
                    skip,
                    billingAddress,
                    hasNextPage: page < totalPage,
                    hasPrevPage: page > 1
                })
        
    } catch (error) {
        logger.error(`Error:${error}`)
    }
}