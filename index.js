require('./db/connections');
const express = require('express');
const app = express();
app.use('/mediaFiles', express.static('mediaFiles'))
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cors = require('cors');
app.use(cors());
app.use(express.json());
const router = require('./router/routers');
app.use(router);



app.listen(5000, '127.0.0.1', () => {
    console.log('Server is Running')
})