import express from 'express'
import { createCategory, getCategory, updateCategory } from '../controller/category';
import { requireAuth } from '../middlerware/requireAuth';
import { checkRole } from '../middlerware/checkRole';
import { createProd, delProd, getProduct, getSingleProd, updateProdStatus, updateProduct } from '../controller/product';
import { createCartItem, delCartItem, getCartItem } from '../controller/cartItem';
import { createOrder } from '../controller/order';


export const category = express.Router();
export const product = express.Router();
export const cartItem = express.Router()
export const order = express.Router()

category.post("/create", requireAuth, checkRole(["ADMIN"]), createCategory )
category.put("/update/:id", requireAuth, checkRole(["ADMIN"]), updateCategory)
category.get("/", getCategory)

product.post("/create", requireAuth, checkRole(["ADMIN"]), createProd)
product.put("/update/:id", requireAuth, checkRole(["ADMIN"]), updateProduct)
product.get("/", getProduct)
product.get("/:id", requireAuth, checkRole(["ADMIN", "APP_USER"]), getSingleProd)
product.delete("/del/:id", requireAuth, checkRole(["ADMIN"]), delProd )
product.put("/updateStatus/:id", requireAuth, checkRole(["ADMIN"]), updateProdStatus)

cartItem.post("/create", requireAuth, checkRole(["ADMIN", "APP_USER"]), createCartItem)
cartItem.get("/", requireAuth, checkRole(["ADMIN","APP_USER"]), getCartItem)
cartItem.delete("/del", requireAuth, checkRole(["ADMIN", "APP_USER"]), delCartItem)

order.post("/create", requireAuth, checkRole(["ADMIN", "APP_USER"]), createOrder)