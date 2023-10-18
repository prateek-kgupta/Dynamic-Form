const express = require("express");
const cors = require('cors')
require("./db/mongoose");
// require('./router/googleAuth')

const app = express();
app.use(express.json());
const corsOptions = {
    origin: "*"
}

app.use(cors(corsOptions))

const loginRoutes = require('../src/router/loginRoutes')
const formRoutes = require('../src/router/formRoutes')
const responseRoutes = require('../src/router/responseRoutes')

app.use('/user', loginRoutes)
app.use('/form', formRoutes)
app.use('/response', responseRoutes)



const port = process.env.PORT || 3000

app.listen(port, ()=>console.log("Server is listening at port",port))

