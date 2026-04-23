import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { roleValidator } from "./schema";

export const listPeople = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("people").collect();
  },
});

export const createPerson = mutation({
  args: {
    name: v.string(),
    role: roleValidator,
    color: v.string(),
    initials: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("people", {
      ...args,
      active: true,
    });
  },
});

export const updatePerson = mutation({
  args: {
    id: v.id("people"),
    name: v.string(),
    role: roleValidator,
    color: v.string(),
    initials: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const setPersonActive = mutation({
  args: {
    id: v.id("people"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { active: args.active });
    return args.id;
  },
});
