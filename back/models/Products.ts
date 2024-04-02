import { Schema, model, Document, UpdateQuery } from "mongoose"
import Audit from "./Audit"
import moment from "moment"

type ProductKeys = '_id' | 'code' | 'name' | 'category' | 'hasStock' | 'stock' | 'measurementType'

interface IProduct {
    _id: string,
    code: number,
    name: string,
    category: string,
    hasStock: boolean,
    stock: number,
    measurementType: string,
    [key: string]: any
}

const ProductSchema = new Schema<IProduct>({
    code: Number,
    name: String,
    category: String,
    hasStock: Boolean,
    stock: Number,
    measurementType: String,
})

ProductSchema.pre("updateOne", async function (next) {

    const docToUpdate = await this.model.findOne(this.getQuery()).exec();
    const beforeUpdate = docToUpdate.toObject();
    const update = this.getUpdate() as UpdateQuery<IProduct>;

    if ('$set' in update) {

        const changes: Record<string, any> = {};
        const setUpdate = update.$set;

        for (const key in setUpdate) {

            if(key == "_id") continue

            if (Object.prototype.hasOwnProperty.call(setUpdate, key)) {
                const oldValue = beforeUpdate[key]; 
                const newValue = setUpdate[key]; 

                if (oldValue !== newValue) {
                    changes[key] = {
                        from: oldValue,
                        to: newValue,
                    };
                }
            }
        }

        if (Object.keys(changes).length > 0) {

            const audit = new Audit({
              productId: docToUpdate._id,
              changes: changes,
              updatedAt: moment().format()
            });

            await audit.save();
        }

    }

    next();
})

const Product = model("Product", ProductSchema, "products")

export default Product

export {
    ProductSchema,
    IProduct
}