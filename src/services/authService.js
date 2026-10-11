import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userRegistrationService = async(name,email,password)=>{
    const existingUser = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);
    if(existingUser.rowCount>0){
        throw new Error("User Exist")
    }
    
    const hashPassword = await bcrypt.hash(password,10)
    const result = await pool.query("INSERT INTO users (name,email,password,created_at) VALUES($1, $2, $3,NOW()) RETURNING *", [name,email,hashPassword])
    return result.rows[0];

}


export const loginUserService = async(email,password)=>{
    const result = await pool.query(`SELECT id,name,email,password FROM users WHERE email = $1`,[email]);

    if(result.rowCount===0){
        throw new Error("Invalid Credentials")
    }

    const user = result.rows[0]

    const isPassword = await bcrypt.compare(password,user.password);

    if(!isPassword){
        throw new Error("Inavlid Credentials")
    }

    const token = jwt.sign({
        id : user.id
    },process.env.JWT_SECRET_TOKEN, {expiresIn: "1h"})

    return{
        token,
        user :{
            id : user.id,
            email : user.email
        }
    }
}

