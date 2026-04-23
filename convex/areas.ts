import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listAreas = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("areas").withIndex("by_order").collect();
  },
});

export const createArea = mutation({
  args: {
    name: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("areas", args);
  },
});

export const updateArea = mutation({
  args: {
    id: v.id("areas"),
    name: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      order: args.order,
    });
    return args.id;
  },
});

export const reorderAreas = mutation({
  args: {
    areas: v.array(
      v.object({
        id: v.id("areas"),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await Promise.all(
      args.areas.map((area) => ctx.db.patch(area.id, { order: area.order })),
    );
    return args.areas.length;
  },
});

export const deleteArea = mutation({
  args: {
    id: v.id("areas"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_area", (q) => q.eq("areaId", args.id))
      .first();

    if (task) {
      throw new ConvexError({
        code: "AREA_IN_USE",
        message: "Não é possível apagar uma área que tem tarefas.",
      });
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});
