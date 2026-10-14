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

        const result = await pool.query('Select id and password hash from users where username=$1', [email])

        if(result.rowCount === 0) {
            return NextResponse.json({error: 'Credentials failed. Please try again.'}, {status: 401})
        }
        const user = result.rows[0]
        const match = await bcrypt.compare(password, user.password_hash)
        if(!match) {
            return NextResponse.json({error: 'Credentials failed. Please try again.'}, {status: 401})
        }
        //There's an expire property that I may get rid of if it's optional. Or have it removed after 6 months; an hour is a short time
        const token = jwt.sign({userId: user.id, email}, process.env.JWT_SECRET as string, {expiresIn: '1h'});

        return NextResponse.json({token})

    } catch (error:any){
        console.error('Registration Error: ', error)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}