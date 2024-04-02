import AuthHandlers from "../handlers/AuthHandlers"
import { Router } from "express"

const AuthRouter = Router()

AuthRouter.post('/verifySession', AuthHandlers.verifySession)
AuthRouter.post('/logIn', AuthHandlers.logIn)

export default AuthRouter