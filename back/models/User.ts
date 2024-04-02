import { Schema, model } from "mongoose"

interface IUser {
    email: string,
    password: string,
}

const UserSchema = new Schema<IUser>({
    email: String,
    password: String,
})

const User = model("User", UserSchema, "users")

export default User

export {
    UserSchema,
    IUser,
}