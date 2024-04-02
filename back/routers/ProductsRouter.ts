import ProductHandlers from "../handlers/ProductHandlers";
import { Router } from "express";

const ProductRouter = Router()

ProductRouter.get('/', ProductHandlers.getProducts)
ProductRouter.get('/getAProduct', ProductHandlers.getAProduct)
ProductRouter.get('/changes', ProductHandlers.changes)
ProductRouter.post('/getProducts', ProductHandlers.postGetProducts)
ProductRouter.get('/categories', ProductHandlers.getCategories)
ProductRouter.post('/addProduct', ProductHandlers.addProduct)
ProductRouter.put('/updateAProduct', ProductHandlers.updateAProduct)
ProductRouter.delete('/deleteAProduct', ProductHandlers.deleteAProduct)

export default ProductRouter