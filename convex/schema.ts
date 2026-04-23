import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("owner"),
  v.literal("worker"),
  v.literal("other"),
);

export const statusValidator = v.union(
  v.literal("backlog"),
  v.literal("todo"),
  v.literal("doing"),
  v.literal("blocked"),
  v.literal("waiting_material"),
  v.literal("done"),
);

export const priorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

export const costCategoryValidator = v.union(
  v.literal("materials"),
  v.literal("labor"),
  v.literal("tools"),
  v.literal("furniture"),
  v.literal("decoration"),
  v.literal("other"),
);

export default defineSchema({
  people: defineTable({
    name: v.string(),
    role: roleValidator,
    color: v.string(),
    initials: v.string(),
    active: v.boolean(),
  }).index("by_active", ["active"]),

  areas: defineTable({
    name: v.string(),
    order: v.number(),
  }).index("by_order", ["order"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    areaId: v.id("areas"),
    status: statusValidator,
    priority: priorityValidator,
    ownerId: v.id("people"),
    allowedPersonIds: v.array(v.id("people")),
    requiresOwnerDecision: v.boolean(),
    ownerDecisionDone: v.boolean(),
    dependencyIds: v.array(v.id("tasks")),
    estimatedCost: v.optional(v.union(v.number(), v.null())),
    actualCost: v.optional(v.union(v.number(), v.null())),
    costCategory: costCategoryValidator,
    dueDate: v.optional(v.union(v.string(), v.null())),
    startDate: v.optional(v.union(v.string(), v.null())),
    completedAt: v.optional(v.union(v.string(), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
    materialNeeded: v.boolean(),
    materialNotes: v.optional(v.union(v.string(), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_area", ["areaId"])
    .index("by_owner", ["ownerId"]),

  activityLog: defineTable({
    taskId: v.id("tasks"),
    actionType: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    personId: v.optional(v.id("people")),
    timestamp: v.number(),
  }).index("by_task", ["taskId"]),
});
