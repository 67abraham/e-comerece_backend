import type { Request, Response } from "express";
import { logger } from "../../lib/logger";
import {randomBytes} from 'crypto'
import { prisma } from "../../lib/prisma";
import type { OrderStatus } from "../../generated/prisma/enums";
import { order } from "../routes/route";


const generateCode = ()=>{
    const rand = randomBytes(3).toString("hex").toUpperCase()
    return `ORD-${rand}`
}
export const createOrder = async(req:Request, res:Response)=>{
    
    try {
        const {cartID, shippingMethod} = req.body
        if(cartID.length < 0) return res.status(400).json({message:"No CartItem Found"});

        const getOrderItem = await prisma.cartItem.findMany({
                where:{
                    id:{in: cartID},
                    userId: (req as any).user.id
                },
                include:{
                    product:{
                        select:{
                            name:true,
                            imageUrl:true,
                            price:true,
                            productLocation:true
                        }
                    }
                }
        });
    
        const totalAmount = getOrderItem.reduce((sum, data)=> sum + (data.product.price * data.quantity),0)
           
        const createOr = await prisma.order.create({
                data:{
                    orderNumber: generateCode(),
                    totalAmount,
                    userId: (req as any).user.id,
                    shippingMethod
                },
    
        })

        const loopCartItem = await Promise.all([
            getOrderItem.filter((data)=> data.orderId === null).map((d)=>
                prisma.cartItem.update({
                    where:{id: d.id},
                    data:{
                        orderId:createOr.id,
                        ordered: true
                    }
                })
            )
        ]) 
    
           logger.info("Order Created")
           res.status(201).json({message: "Order Created"})
        
    } catch (error) {
        logger.error(`Error: ${error}`)
    }
}

export const getOrder = async(req:Request, res:Response)=>{
    try {
        const page = Math.max(1, Number((req.query.page as string)) || 1);
        const limit = Math.max(1, Number((req.query.limit as string))|| 10);
        const skip = (page-1)*limit;

        const [getO, totalOrder] = await Promise.all([
            prisma.order.findMany({
                skip,
                take:limit,
                orderBy:{
                    status:"asc"
                },
                where: {id: (req as any).user.id},
                include:{
                    item:{
                        include:{
                            product:{
                                select:{
                                    name:true,
                                    imageUrl:true,
                                    price:true,
                                    productLocation:true
                                }
                            }
                        }
                    }
                }
    
            }),
            prisma.order.count({where:{id:(req as any).user.id}})
        ]);

         const totalPage = Math.ceil(totalOrder / limit);
                        logger.info("Delete Product")
                        res.status(200).json({
                            getO,
                            totalPage,
                            skip,
                            hasNextPage: page < totalPage,
                            hasPrevPage: page > 1
            })
        
    } catch (error) {
       logger.error(`Error: ${error}`) 
    }
}

export const updateOrder = async(req:Request, res:Response)=>{
    try {
        const {id}=req.params as {id:string}
        const {stat}=req.query.status as {stat:OrderStatus}

        if(!id || !stat) return res.status(400).json({message: "Invalid Request"});

        const updateO = await prisma.order.update({
            where:{id},
            data:{
                status: stat
            }
        })

        logger.info("Update OrderStatus")
        res.status(200).json({message: "Update Successful"})
    } catch (error) {
        logger.error(`Error: ${error}`)        
    }
}