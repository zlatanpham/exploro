import { NextResponse } from "next/server";
import {
  withApiAuth,
  getQueryParams,
  parseJsonBody,
} from "@/lib/api/middleware";
import { db } from "@/server/db";
import { z } from "zod";

// GET /api/v1/tags - List tags
export const GET = withApiAuth(
  async (request, _context) => {
    const searchParams = getQueryParams(request);
    const category = searchParams.get("category");

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = category;
    }

    // Get tags with usage count
    const tags = await db.tag.findMany({
      where,
      orderBy: { name_vi: "asc" },
      include: {
        _count: {
          select: { DishTag: true },
        },
      },
    });

    return NextResponse.json({
      tags: tags.map((tag) => ({
        id: tag.id,
        name_vi: tag.name_vi,
        name_en: tag.name_en,
        category: tag.category,
        usage_count: tag._count.DishTag,
      })),
      total: tags.length,
    });
  },
  { requiredPermission: "read" },
);

// Schema for creating tag
const createTagSchema = z.object({
  tag: z.object({
    name_vi: z.string().min(1, "Vietnamese name is required").max(100),
    name_en: z.string().max(100).optional(),
    category: z.string().max(50).optional(),
  }),
});

// POST /api/v1/tags - Create tag
export const POST = withApiAuth(
  async (request, _context) => {
    const body = await parseJsonBody(request, (data) =>
      createTagSchema.parse(data),
    );

    const { tag: tagData } = body;

    // Check for duplicate tag by Vietnamese name
    const existingTag = await db.tag.findFirst({
      where: {
        name_vi: {
          equals: tagData.name_vi,
          mode: "insensitive",
        },
      },
    });

    if (existingTag) {
      return NextResponse.json(
        {
          duplicate_found: true,
          tag: {
            id: existingTag.id,
            name_vi: existingTag.name_vi,
            name_en: existingTag.name_en,
            category: existingTag.category,
          },
          message: "A tag with this Vietnamese name already exists",
        },
        { status: 200 }, // Return 200 with duplicate info instead of error
      );
    }

    // Create new tag
    const newTag = await db.tag.create({
      data: tagData,
    });

    return NextResponse.json(
      {
        duplicate_found: false,
        tag: {
          id: newTag.id,
          name_vi: newTag.name_vi,
          name_en: newTag.name_en,
          category: newTag.category,
        },
      },
      { status: 201 },
    );
  },
  { requiredPermission: "write" },
);
