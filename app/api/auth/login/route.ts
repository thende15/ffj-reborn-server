import { NextResponse, NextRequest } from "next/server";
import bcrypt from 'bcrypt';
import pool from "@/app/utils/db";
import jwt from 'jsonwebtoken'

export async function POST(request:NextRequest) {
    try {
        const {email, password} = await request.json();
        if(!email || !password) {
            return NextResponse.json({error: 'Email and password are required.'}, {status: 400})
        }

        const result = await pool.query('Select global_id, password from accounts where email=$1', [email])

        if(result.rowCount === 0) {
            return NextResponse.json({error: 'Credentials failed. Please try again.'}, {status: 401})
        }
        const user = result.rows[0]
        const match = await bcrypt.compare(password, user.password)
        if(!match) {
            return NextResponse.json({error: 'Credentials failed. Please try again.'}, {status: 401})
        }
        //There's an expire property that I may get rid of if it's optional. Or have it removed after 6 months; an hour is a short time
        const profiles = await pool.query( `SELECT * FROM profiles WHERE profiles.account_id = ${user.global_id}`)
        const token = jwt.sign({userId: user.global_id, email}, process.env.JWT_SECRET as string, {expiresIn: '1h'});

        return NextResponse.json({message:"Login Successful!", token: token, profiles: profiles.rows[0]}, {status: 200})

    } catch (error:any){
        console.error('Registration Error: ', error)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}