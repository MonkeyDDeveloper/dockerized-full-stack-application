import express from "express"
import jwt from "jsonwebtoken"
import cors from "cors"
import {connectDb} from "./db"
import User, {IUser} from "./models/User"
import Category, {ICategory} from "./models/Categories"
import Product, {IProduct} from "./models/Products"
import AuthHandlers from "./handlers/AuthHandlers"
import { Document } from "mongoose"
import { ProductRouter, AuthRouter } from "./routers"

const app = express()
const dbUri = "mongodb://monguito:27017/store"
const port = process.env.BACK_API_PORT || 5500
const passwordTokenKey = process.env.PASSWORD_TOKEN_KEY || "password_secret"
const sessionTokenKey = process.env.SESSION_TOKEN_KEY || "session_secret"

console.log({dbUri, passwordTokenKey, sessionTokenKey})

function varifyInitialData() {

    return new Promise(async (res, rej) => {

        let adminUser: Document<IUser> | null = null
        let categories: (Document<ICategory>)[] = []
        let products: (Document<IProduct>)[] = []

        try {

            adminUser = await User.findOne({email: 'admin@admin.com'})

        }
        catch(err) {

            console.log("Error looking for admin user" + err)
            return rej("Error looking for admin user" + err)

        }

        if(!adminUser) {

            const adminUser = new User({
                email: "admin@admin.com",
                password: jwt.sign("1234admin", passwordTokenKey)
            })

            await adminUser.save()

        }

        try {

            categories = await Category.find()

        }
        catch(err) {

            console.log("Error looking for categories user" + err)
            return rej("Error looking for categories user" + err)

        }
        try {

            categories = await Category.find()

        }
        catch(err) {

            console.log("Error looking for categories user" + err)
            return rej("Error looking for categories user" + err)

        }

        if(categories.length == 0) {

            const newCategories = [new Category({name: "home"}), new Category({name: "office"}), new Category({name: "electronic"})]

            for(const newCategorie of newCategories) {

                await newCategorie.save()

            }

        }

        try {

            products = await Product.find()

        }
        catch(err) {

            console.log("Error looking for products" + err)
            return rej("Error looking for products" + err)

        }

        if(products.length == 0) {

            const productOne = new Product({name: "Product 1", code: 1234, category: "home", hasStock: true, stock: 40, measurementType: "lb"})
            const productTwo = new Product({name: "Product 2", code: 5678, category: "office", hasStock: false, stock: 0, measurementType: "Kg"})

            const newProducts = [productOne, productTwo]

            for(const newProduct of newProducts) {

                await newProduct.save()

            }

        }

        res(true)

    })

}

async function initApp() {

    try {

        await connectDb(dbUri as string)

    }
    catch(err) {

        console.log("Error connecting to the database", {err})
        return

    }

    try {
        await varifyInitialData()
    }
    catch(err) {
        console.log("Error verifying admin user", {err})
        return
    }

    app.use(cors())
    app.use(express.json())

    app.use('/auth', AuthRouter)
    app.use(AuthHandlers.verifySession)
    app.use('/products', ProductRouter)

    app.listen(port, () => console.log("Listening on port " + port))

}

initApp()