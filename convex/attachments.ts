import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { attachmentKindValidator } from "./schema";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

const MAX_ATTACHMENTS_PER_TASK = 4;

export const createAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    storageId: v.id("_storage"),
    kind: attachmentKindValidator,
    caption: v.optional(v.string()),
    price: v.optional(v.union(v.number(), v.null())),
    sourceUrl: v.optional(v.string()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("attachments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    if (existing.length >= MAX_ATTACHMENTS_PER_TASK) {
      await ctx.storage.delete(args.storageId);
      throw new Error(`Máximo de ${MAX_ATTACHMENTS_PER_TASK} fotos por tarefa.`);
    }

    const isMain = existing.length === 0;

    return await ctx.db.insert("attachments", {
      ...args,
      isMain,
      createdAt: Date.now(),
    });
  },
});

export const setMainAttachment = mutation({
  args: { id: v.id("attachments") },
  handler: async (ctx, { id }) => {
    const target = await ctx.db.get(id);
    if (!target) return;

    const siblings = await ctx.db
      .query("attachments")
      .withIndex("by_task", (q) => q.eq("taskId", target.taskId))
      .collect();

    await Promise.all(
      siblings.map((sibling) =>
        ctx.db.patch(sibling._id, { isMain: sibling._id === id }),
      ),
    );
  },
});

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const rows = await ctx.db
      .query("attachments")
      .withIndex("by_task", (q) => q.eq("taskId", taskId))
      .order("desc")
      .collect();
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        url: await ctx.storage.getUrl(row.storageId),
      })),
    );
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db.query("attachments").order("desc").take(limit ?? 12);
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        url: await ctx.storage.getUrl(row.storageId),
      })),
    );
  },
});

export const deleteAttachment = mutation({
  args: { id: v.id("attachments") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    await ctx.storage.delete(row.storageId);
    await ctx.db.delete(id);

    if (row.isMain) {
      const replacement = await ctx.db
        .query("attachments")
        .withIndex("by_task", (q) => q.eq("taskId", row.taskId))
        .order("desc")
        .first();
      if (replacement) {
        await ctx.db.patch(replacement._id, { isMain: true });
      }
    }
  },
});
