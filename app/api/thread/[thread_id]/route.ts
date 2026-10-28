import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/utils/db";


export async function GET(
    request: NextRequest,
    {params}: {params: Promise<{thread_id: string}>}
) {
    try {
        const prom = await params
        const thread_id = parseInt(prom.thread_id, 10)
        const query = await pool.query(
            `SELECT * FROM posts WHERE board_id = ${thread_id}`
        )
        if(query.rows.length === 0) return NextResponse.json({error: 'There are no posts in this thread'}, {status: 404})
        return NextResponse.json(query.rows)
    } catch(error) {
        console.error("We encountered a problem; try again later.", error)
        return NextResponse.json(
            {error: "A failure to retrieve data has failed."}, 
            {status: 500}
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const {title, content} = await request.json()
        if(!title || !content) {
            return NextResponse.json({error: 'Title and content are required'}, {status: 400})
        }

        //this is where we're inserting into the table
        // const result = await pool.query()
    } catch (error) {
        console.error("We encountered a problem; try again later.", error)
        return NextResponse.json(
            {error: "A failure to retrieve data has failed."}, 
            {status: 500}
        )
    }
}