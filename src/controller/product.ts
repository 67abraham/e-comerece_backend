import type { Request, Response } from "express";
import { logger } from "../../lib/logger";
import { prisma } from "../../lib/prisma";

export const createProd = async(req:Request, res:Response)=>{
    try {
        const {name, catId, imagUlr, price, location, moq, des} = req.body

        if(!name || !catId || !price) return res.status(400).json({message: "All Field is Required"});

        const createProd = await prisma.product.create({
            data:{
                name,
                categoryId: catId,
                imageUrl : imagUlr,
                price,
                description: des,
                minimumOrder: moq,
                productLocation: location
            }
        })

        logger.info(`Product Create: ${createProd.name}`)

        res.status(201).json(createProd)

    } catch (error) {
        logger.error(`Error: ${error}`)
        
    }

}