//1 import express
const express = require("express");


//4 import cors
const cors = require("cors");

//import logic.js
const logic=require('./services/logic')

//import jwttoken
const jwt = require('jsonwebtoken')

//2 use express to create a server
const server1 = express();


//5 use cors in server app
server1.use(cors({
    origin: "http://localhost:4200"
}));

//6 Parse json data to the js in server app
server1.use(express.json());

//7 To resolve client requests
// server1.get("/",(req,res)=>{
//     res.send('GETs METHOD')
// })
// server1.post("/",(req,res)=>{
//     res.send('POSTman METHOD')
// })
//Bank requests
//register
//login
//balance enquery
//fund transfer

//register api call
server1.post('/register',(req,res)=>{

    logic.register(req.body.acno,req.body.username,req.body.password).then((result)=>{
        res.status(result.statusCode).json(result)
    })
    console.log(req.body)
    // res.send('Resgister Request Recieved')
    // res.status(200).json({message:'Request Recieved'})
})

//login api call
server1.post('/login',(req,res)=>{
    console.log('Inside the login api call');
    logic.login(req.body.acno,req.body.password).then((result)=>{
        res.status(result.statusCode).json(result)
    })
    console.log(req.body);
})

//middleware for verifying token to check user is logined or not 
const jwtMiddleware =(req,res,next)=>{

    //get token from req header
    const token=req.headers['verify-token'];
    console.log(token)
    try{
        const data = jwt.verify(token,'sk23')
        console.log(`verified token= `,data)
        req.currentAcno=data.loginAcno
        next()
    }
    catch{
        res.status(401).json({message:'Please Login'})
    }
    
    console.log('Router specific middleware')
    
}

//getbalance api call
server1.get('/getbalance/:acno',jwtMiddleware,(req,res)=>{
    console.log(`req at get balance=`,req);
    logic.getBalance(req.params.acno).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})


//3 setup port for the server 
server1.listen(5000,()=>{
    console.log("Listening on the port 5000");
});

//application specific middleware
const appMiddleware =(req,res,next)=>{
    next()
    console.log(`Application specific middleware`);
}

//use application specific middleware
server1.use(appMiddleware)


//fund transfer api call
server1.post('/fund-transfer',jwtMiddleware,(req,res)=>{
    console.log('Inside the fund transfer');
    console.log(`fundtransfer req.body`,req.body);
    logic.fundTransfer(req.currentAcno,req.body.password,req.body.toAcno,req.body.amount).then((result)=>{
        res.status(result.statusCode).json(result)
    })

})

//get transaction api call
server1.get('/getTransactionHistory',jwtMiddleware,(req,res)=>{
    console.log('Inside get Transaction');
    logic.getTransactionHistory(req.currentAcno).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})

//deleteUserAccount
server1.delete('/delete-account',jwtMiddleware,(req,res)=>{
    console.log('Inside delete function');
    logic.deleteUserAccount(req.currentAcno).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})



