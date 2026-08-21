import express from 'express'
import { createCategory, getCategory, updateCategory } from '../controller/category';
import { requireAuth } from '../middlerware/requireAuth';
import { checkRole } from '../middlerware/checkRole';


export const category = express.Router();

category.post("/create", requireAuth, checkRole(["ADMIN"]), createCategory )
category.put("/update/:id", requireAuth, checkRole(["ADMIN"]), updateCategory)
category.get("/", getCategory)