import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";

export const createCategory = async(req:Request, res:Response)=>{

    try {
        const {name} = req.body
        const existingName = await prisma.category.findUnique({where:{name}})
        if(existingName) return res.status(401).json({message: "Name exist"});
    
        const tag = name.toLowerCase();
    
        const saveName = await prisma.category.create({
            data:{
                name,
                tag
            }
        })
        logger.info(`Category Name: ${saveName.name}`)
        res.status(201).json(saveName)
        
    } catch (error) {
        console.log(`Error: ${error}`)
        logger.error(`Error: ${error}`)
        
    }


}

export const updateCategory =async(req:Request, res:Response)=>{
    try {
        const {id}= req.params as {id:string}
        const {name} = req.body;

        const existingName = await prisma.category.findUnique({where:{name}})
        if(existingName) return res.status(400).json({message: "Name exist"});

        const updateCate = await prisma.category.update({
            where: {id},
            data:{name, tag: name.toLowerCase()}
        });

        logger.info(`Update-Category Name: ${updateCate.name}`)
        res.status(200).json(updateCate);

    } catch (error) {
        logger.error(`Error: ${error}`)
    }
}

export const delCategory = async (req:Request, res:Response)=>{
    try {
        const {id} = req.params as {id:string}
        
        const delCa = await prisma.category.delete({
            where: {id}
        })

        logger.info("DELETE CATEGORY")
        res.status(200).json({message: "Delete Successful"})
    } catch (error) {
        console.log(Error)
        logger.error(`Error: ${error}`)
    }
}

//get cate

export const getCategory = async(req:Request, res:Response)=>{
    try {

        const getCat = await prisma.category.findMany();

        logger.info(`Get-Category Name`)

       res.status(200).json(getCat)
        
    } catch (error) {
        logger.error(`Error: ${error}`)
    }
}