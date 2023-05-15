//import db.js
const { response } = require('express')
const db=require('./db')

//import jwt token
const jwt=require('jsonwebtoken')

//logic for register //asynchronous function => in promise => .then/.catch
const register=(acno,username,password)=>{
    console.log('Inside the Register function')

    //check acno in db
    return db.User.findOne({
        acno
    }).then((response)=>{
        // console.log(response)

        if(response){
            return{
                statusCode:401,
                message:'Account Number Already in use'
            }
        }else{
            //create new object for registration
            const newUser=new db.User({
                acno,
                username,
                password,
                balance:5000,
                transaction:[]
            })
            //to save in database
            newUser.save()
            //to send respose back to the client
            return{
                statusCode:200,
                message:'Successfully Registered'
            }

        }

    })
}

//logic for login //asynchronous function /promise /then
const login=(acno,password)=>{
    console.log('Inside the login funtion')
    return db.User.findOne({acno,password}).then((result)=>{
        //acno present in database
        if(result){
            //generate token
            const token=jwt.sign({loginAcno:acno},'sk23')
            return{
                statusCode:200,
                message:'Successfully Logged In',
                currentUser:result.username,
                token,              
                currentAcno:acno   //send to the client
            }
        }else{  //if acno not present in database
            return{
                statusCode:401,
                message:'Invalid data in Login Form'
            }
        }
    })
}

//logic for balance enquiry
const getBalance=(acno)=>{
    //check acno in db
    return db.User.findOne({acno}).then((result)=>{
        if(result){
            return{
                statusCode:200,
                balance:result.balance
            }
        }
        else{
            return{
                statusCode:401,
                message:'Invalid Data'
            }
        }
    })
}


//fund transfer
const fundTransfer=(fromAcno,fromAcnoPswd,toAcno,amt)=>{
    //convert amt into a number
    let amount=parseInt(amt)

    //check fromAcno in mongodb
    return db.User.findOne({
        acno: fromAcno,
        password: fromAcnoPswd
    }).then((debitdetails)=>{
        if(debitdetails){
            //to check toAcno
            return db.User.findOne({acno:toAcno}).then((creditdetails)=>{
                if(creditdetails){
                    if(debitdetails.balance>amount){

                        debitdetails.balance-=amount
                        debitdetails.transaction.push({
                            type:"Debit",
                            amount,
                            fromAcno,
                            toAcno
                        })

                        //save changes to mongodb
                        debitdetails.save()

                        //update to the toAcno
                        creditdetails.balance+=amount
                        creditdetails.transaction.push({
                            type:"Credit",
                            amount,
                            fromAcno,
                            toAcno
                        })

                        //save changes to mongodb
                        creditdetails.save()

                        //send response to the Client side
                        return{
                            statusCode:200,
                            message: 'Fund Transfer Successful'
                        }


                    }else{
                        return{
                            statusCode:401,
                            message:'Insufficient Balance'
                        }
                    }

                }else{
                    return{
                        statusCode:401,
                        message:'Invalid Data'
                    }
                }
            })
            
        }else{
            return{
                statusCode:401,
                message:'Invalid Data'
            }
        }
    })
}

const getTransactionHistory=(acno)=>{
    return db.User.findOne({acno}).then((result)=>{
        if(result){
            return{
                statusCode:200,
                transaction:result.transaction
            }
        }else{
            return{
                statusCode:401,
                message:'Invalid Data'
            }
        }
    })
}

//deleteUserAccount
const deleteUserAccount=(acno)=>{
    //acno delete from mongodb
    return db.User.deleteOne({acno}).then((result)=>{
        return{
            statusCode:200,
            message:'Account deleted Successfully'
        }
    }) 
}


//export
module.exports={
    register,
    login,
    getBalance,
    fundTransfer,
    getTransactionHistory,
    deleteUserAccount
}

