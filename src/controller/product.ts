import type { Request, Response } from "express";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";
import { broadcastMessage } from "../utility/websock";
import { ProductStatus } from "../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const createProd = async(req:Request, res:Response)=>{
    try {
        const {name, categoryId, imageUrl, price, productLocation, minimumOrder, description} = req.body

        if(!name || !categoryId || !price) return res.status(400).json({message: "All Field is Required"});

        const createProd = await prisma.product.create({
            data:{
                name,
                categoryId,
                imageUrl,
                price,
                description,
                minimumOrder,
                productLocation
            }
        })

        logger.info(`Product Create: ${createProd.name}`)
        broadcastMessage({event:"create:product", data: createProd})
        res.status(201).json(createProd)

    } catch (error) {
        logger.error(`Error: ${error}`)
        
    }

}


export const updateProduct =async(req:Request, res:Response)=>{
    try {
        const {id}=req.body as {id:string}
        const {name, categoryId, imageUrl, price, productLocation, minimumOrder, description} = req.body

        if(!name || !categoryId || !price) return res.status(400).json({message: "All Field is Required"});

        const createProd = await prisma.product.update({
            where:{id},
            data:{
                name,
                categoryId,
                imageUrl,
                price,
                description,
                minimumOrder,
                productLocation
            }
        })

        logger.info("Update Product")
        res.status(200).json({message:"Update Successful"})

        
    } catch (error) {
         logger.error(`Error: ${error}`)
    }
}

export const updateProdStatus = async(req:Request, res:Response)=>{
    try {
        const {id} = req.params as {id:string}
        const status = req.query.status as ProductStatus
        logger.info(`Status: ${status}`)

        const changeStatus = await prisma.product.update({
            where:{id},
            data:{
                status
            }
        })
        
        logger.info("Update Product Status")
        res.status(200).json({message:"Update Status Successful"})

    } catch (error) {
        logger.error(`Error: ${error}`)
    }
}

export const delProd =  async(req:Request, res:Response)=>{
    try {
        const {id}= req.params as {id:string}

        const del = await prisma.product.delete({
            where:{id}
        })
    
        logger.info("Delete Product")
        res.status(200).json({message:"Deleted Successful"})

    } catch (error) {
        logger.error(`Error: ${error}`)
    }
}

export const getProduct =async(req:Request, res:Response)=>{
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })
        const page = Math.max(1, Number((req.query.page as string)) || 1);
        const limit = Math.max(1, Number((req.query.limit as string))|| 10);

        const skip = (page-1)*limit;

        const available = session?.user.role === "ADMIN" ? undefined: ProductStatus.AVAILABLE

        const [getAllProd, totalProduct] = await Promise.all([ prisma.product.findMany({
            skip,
            take: limit,
            orderBy:{
                name: "asc"
            },
            where:{status:available}
        }), prisma.product.count({where:{status:available}})])

        const totalPage = Math.ceil(totalProduct / limit);

        logger.info("Delete Product")
        res.status(200).json({
            getAllProd,
            totalPage,
            skip,
            hasNextPage: page < totalPage,
            hasPrevPage: page > 1
        })


    } catch (error) {
        logger.error(`Error: ${error}`)

    }
}



export const getSingleProd = async(req:Request, res:Response)=>{
    try {

        const {id}=req.params as {id:string}

        const getProd = await prisma.product.findUnique({
            where:{id},
            include:{
                comment:{
                    include:{
                        user:{
                            select:{name:true, image:true,}
                        }
                    }
                }
            }
        })

        logger.info("Get Single Prod Detail")
        res.status(200).json(getProd)
        
    } catch (error) {
       logger.error(`Error: ${error}`) 
    }
}