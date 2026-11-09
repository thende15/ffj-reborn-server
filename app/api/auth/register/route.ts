import { NextResponse, NextRequest } from "next/server";
import bcrypt from 'bcrypt';
import pool from "@/app/utils/db";
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const {email, password, global_id, account_creation} = payload;
        const profile = payload.profiles[0];
        if(!email || !password) {
            return NextResponse.json({error: 'Email and password are required.'}, {status: 400})
        }
        const checkUser = await pool.query('SELECT account_id FROM accounts WHERE email=$1', [email])
        if(checkUser && checkUser.rowCount !> 0) {
            return NextResponse.json({error: 'Email already exists!'}, {status: 409})
        }

        //scrambles password before storing it. makes it harder to obtain, and I like it. Need to look into the
        //second param more as it's the salting to properly hash it; I'm ignorant and need more data. 
        const passwordHash = await bcrypt.hash(password, 10)
        const rows = (await pool.query('SELECT * FROM accounts')).rowCount
        //TODO: create two tables, one for uses and one for accounts. insert email/password into accounts, assign an id. have that id show up in the created profile. 
        //That way when we log in we can dynamically create object on login. Create login bool for profiles so when user logs in they will automatically be assigned
        //who they are.
        //We will need 2 queries, I believe. One for accounts, one for users. No way to split inserts
        //Silver lining, at least we won't have to do loops. Can grab the first value.
        await pool.query(`INSERT into accounts 
                            (email, password, global_id, account_creation) values ($1, $2, $3, $4)`, 
                            [email, passwordHash, global_id, account_creation]
                        )
        await pool.query(`INSERT into profiles 
                            (name, handle, account_id, avatar, first_seen_at, updated_at, settings, post_count, group_info, experience, tokens, logged_in) 
                            values ($1, $2, $3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, 
                            [profile.name, profile.handle, profile.account_id, profile.avatar, profile.first_seen_at, profile.updated_at, profile.settings, profile.post_count, profile.group, profile.exp, profile.tokens, profile.logged_in]
                        )
        const token = jwt.sign({userId: global_id, email}, process.env.JWT_SECRET as string, {expiresIn: '1h'});
        return NextResponse.json({message: 'User registered successfully.', token: token}, {status: 201})

    } catch (error:any){
        console.error('Registration Error: ', error)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500})
    }
}