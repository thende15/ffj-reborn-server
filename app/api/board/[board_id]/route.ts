import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/utils/db";


export async function GET(
    request: NextRequest,
    {params}: {params: Promise<{board_id: string}>}
) {
    try {
        const prom = await params
        const board_id = parseInt(prom.board_id, 10)
        const query = await pool.query(
            `SELECT * FROM threads WHERE board_id = ${board_id}`
        )
        if(query.rows.length === 0) return NextResponse.json({error: 'Threads do not exist'}, {status: 404})
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