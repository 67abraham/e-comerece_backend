import dotenv from 'dotenv'
import express, {type Application, type Request, type Response} from 'express'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth'
import { category } from './src/routes/route'


dotenv.config();

const app:Application = express();
const PORT=8000
//middleware
app.use(cors({
    origin:process.env.CLIENT_ROUTE || "http://localhost:5173",
    methods:["POST","GET", "PUT","DELETE"],
    credentials:true
}))

app.use(
    helmet({
        crossOriginOpenerPolicy: {policy: "same-origin"}
    })
)

app.all("/api/auth/*splat", toNodeHandler(auth));
//parser

app.use(bodyParser.json())
app.use(express.json())
app.use(cookieParser())

if(process.env.NODE_ENV === 'development'){
    app.use(morgan("dev"))

}
//app route
app.use("/api/category", category)

//global error
app.use((err:Error, req: Request, res:Response)=>{
    console.log(err.stack)
    res.status(500).json({message:"Server: Something Wrong"})
})

app.listen(PORT, ()=>{
    console.log(`Server is Running on Port: ${PORT}`)

})