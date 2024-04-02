import { connect } from "mongoose"

function connectDb (dbUri: string) {
    return new Promise(async (res, rej) => {
        try {
            await connect(dbUri)

            console.log("Connected to the database")

            res(true)
        }
        catch(err) {

            console.log("Error connecting to the database", {err})

            rej(err)

        }
    })
}

export default connectDb