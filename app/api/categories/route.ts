import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/utils/db";


export async function GET() {
    try {
        const result = await pool.query(
            "select category_id, name, position from categories"
        )
        return NextResponse.json(result.rows)
    } catch(error) {
        console.error("We encountered a problem; try again later.", error)
        return NextResponse.json(
            {error: "A failre to retrieve data has failed."}, 
            {status: 500}
        )
    }
}