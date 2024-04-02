import { Schema, model } from "mongoose"

interface ICategory {
    name: string,
}

const CategorySchema = new Schema<ICategory>({
    name: String
})

const Category = model("category", CategorySchema, "categories")

export default Category

export {
    type ICategory,
    CategorySchema
}