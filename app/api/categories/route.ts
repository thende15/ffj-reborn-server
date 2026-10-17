import { NextResponse, NextRequest } from "next/server";
import pool from "@/app/utils/db";


export async function GET() {
    try {
        const query = await pool.query(
            `SELECT
                    c.category_id,
                    c.name,
                    c.position,
                COALESCE(
                    jsonb_agg(
                    jsonb_build_object(
                        'board_id', b.board_id,
                        'category_id', b.category_id,
                        'parent_id', b.parent_id,
                        'name', b.name,
                        'slug', b.slug,
                        'description', b.description,
                        'threads', b.threads,
                        'posts', b.posts,
                        'position', b.position,
                        'updated_at', b.updated_at,
                        'sub_board', '[]'::jsonb
                    )   ORDER BY b.position
                    ) FILTER (WHERE b.board_id IS NOT NULL),
                '[]'::jsonb
                ) AS board_list
                    
                    FROM categories c
                    LEFT JOIN boards b
                    ON c.category_id = b.category_id
                    GROUP BY c.category_id, c.name, c.position
                    ORDER BY c.position`
        )
        return NextResponse.json(query.rows)
    } catch(error) {
        console.error("We encountered a problem; try again later.", error)
        return NextResponse.json(
            {error: "A failure to retrieve data has failed."}, 
            {status: 500}
        )
    }
}