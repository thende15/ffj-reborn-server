import { NextResponse, NextRequest } from "next/server";
import bcrypt from 'bcrypt';
import pool from "@/app/utils/db";

export async function POST(request: NextRequest) {
    try {
        const {email, password} = await request.json();
        if(!email || !password) {
            return NextResponse.json({error: 'Email and password are required.'}, {status: 400})
        }
        const checkUser = await pool.query('Select id from users where username=$1', [email])
        if(checkUser && checkUser.rowCount !> 0) {
            return NextResponse.json({error: 'Email already exists!'}, {status: 409})
        }

        //scrambles password before storing it. makes it harder to obtain, and I like it. Need to look into the
        //second param more as it's the salting to properly hash it; I'm ignorant and need more data. 
        const passwordHash = await bcrypt.hash(password, 10)

        await pool.query('insert into users table.', [email, passwordHash])

        return NextResponse.json({message: 'User registered successfully.'}, {status: 201})

    } catch (error:any){
        console.error('Registration Error: ', error)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}