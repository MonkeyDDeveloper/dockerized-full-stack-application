import { Response, Request } from "express";
import Product, { IProduct } from "../models/Products";
import Category, { ICategory } from "../models/Categories";
import Audit from "../models/Audit";

const ProductHandlers = {
    getProducts: async function (req: Request, res: Response) {
        try {

            console.log(req.headers)

            const products = await Product.find()

            res.status(200).json({
                products
            })
        }
        catch(err) {

            res.status(500).json({
                errorMessage: "Error requesting the products to the database"
            })

        }
    },
    postGetProducts: async function (req: Request, res: Response) {
        try {

            const queryFilters = req.body.queryFilter || {}

            if(queryFilters.name) {
                queryFilters.name = { $regex: queryFilters.name }
            }
            if(queryFilters.code) {

                queryFilters.$where = `function() { return this.code.toString().match(/${queryFilters.code}/) != null }`

                delete queryFilters.code
            }

            console.log({queryFilters})

            const products = await Product.find(queryFilters)

            res.status(200).json({
                products
            })
        }
        catch(err) {

            console.log({err})

            res.status(500).json({
                errorMessage: "Error requesting the products to the database " + err
            })

        }
    },
    getCategories: async function (req: Request, res: Response) {
        try {

            console.log(req.headers)

            const categories = await Category.find()

            res.status(200).json({
                categories
            })
        }
        catch(err) {

            res.status(500).json({
                errorMessage: "Error requesting the categories to the database"
            })

        }
    },
    addProduct: async function(req: Request, res: Response) {
        try {

            const newProductInformation: IProduct = req.body as IProduct

            console.log(req.headers)

            const productWithSameCode = await Product.findOne({code: newProductInformation.code})

            if(productWithSameCode) return res.status(400).json({
                errorMessage: "Product founded with same product code"
            })

            const newProduct = new Product(newProductInformation)

            const createdNewProduct = await newProduct.save()

            res.status(200).json({
                productId: createdNewProduct._id
            })

        }
        catch(err) {

            return res.status(500).json({
                errorMessage: "Internal server error " + err
            })

        }
    },
    updateAProduct: async function(req: Request, res: Response) {
        try {

            const newProductFeatures: IProduct = req.body as IProduct

            const productWithSameCode = await Product.findOne({_id: { $ne: newProductFeatures._id } , code: newProductFeatures.code})

            if(productWithSameCode) return res.status(400).json({
                errorMessage: "Product founded with same product code"
            })

            const productInDB = await Product.findOne({_id: newProductFeatures._id})

            if(!productInDB) return res.status(400).json({
                errorMessage: "Product not found"
            })

            await productInDB.updateOne({ $set: newProductFeatures })

            res.status(200).json({
                productId: productInDB._id
            })

        }
        catch(err) {

            return res.status(500).json({
                errorMessage: "Internal server error " + err
            })

        }
    },
    getAProduct: async function(req: Request, res: Response) {
        try {

            const productCode = req.query.productCode

            const product = await Product.findOne({
                code: productCode
            })

            res.status(200).json({
                product
            })

        }
        catch(err) {

            return res.status(500).json({
                errorMessage: "Internal server error " + err
            })

        }
    },
    changes: async function(req: Request, res: Response) {
        try {

            const productCode = req.query.productCode

            const product = await Product.findOne({
                code: productCode
            })

            if(!product) return res.status(400).json({
                errorMesage: "Product not found"
            })

            const changes = await Audit.find({productId: product._id})

            res.status(200).json({
                changes
            })

        }
        catch(err) {

            return res.status(500).json({
                errorMessage: "Internal server error " + err
            })

        }
    },
    deleteAProduct: async function(req: Request, res: Response) {
        try {

            const productCode = req.query.productCode

            console.log({productCode})

            const existingProduct = await Product.findOne({code: productCode})

            if(!existingProduct) throw "Product not found"

            await existingProduct.deleteOne()

            res.status(200).json({
                success: true
            })

        }
        catch(err) {
            return res.status(500).json({
                errorMessage: "Internal server error " + err
            })
        }
    }
}

export default ProductHandlers