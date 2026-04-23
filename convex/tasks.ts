import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { costCategoryValidator, priorityValidator, statusValidator } from "./schema";

const taskPatchValidator = {
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  areaId: v.optional(v.id("areas")),
  status: v.optional(statusValidator),
  priority: v.optional(priorityValidator),
  ownerId: v.optional(v.id("people")),
  allowedPersonIds: v.optional(v.array(v.id("people"))),
  requiresOwnerDecision: v.optional(v.boolean()),
  ownerDecisionDone: v.optional(v.boolean()),
  dependencyIds: v.optional(v.array(v.id("tasks"))),
  estimatedCost: v.optional(v.union(v.number(), v.null())),
  actualCost: v.optional(v.union(v.number(), v.null())),
  costCategory: v.optional(costCategoryValidator),
  dueDate: v.optional(v.union(v.string(), v.null())),
  startDate: v.optional(v.union(v.string(), v.null())),
  completedAt: v.optional(v.union(v.string(), v.null())),
  notes: v.optional(v.union(v.string(), v.null())),
  materialNeeded: v.optional(v.boolean()),
  materialNotes: v.optional(v.union(v.string(), v.null())),
};

export const listTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getTask = query({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listTaskDependencies = query({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return [];

    const dependencies = await Promise.all(
      task.dependencyIds.map((dependencyId) => ctx.db.get(dependencyId)),
    );

    return dependencies.filter(Boolean);
  },
});

export const createTask = mutation({
  args: {
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
    notes: v.optional(v.union(v.string(), v.null())),
    materialNeeded: v.boolean(),
    materialNotes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("tasks", {
      ...args,
      completedAt: args.status === "done" ? new Date(now).toISOString() : null,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      taskId: id,
      actionType: "created",
      newValue: args.title,
      timestamp: now,
    });

    return id;
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    ...taskPatchValidator,
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
    }

    const now = Date.now();
    const nextPatch = {
      ...patch,
      updatedAt: now,
    };

    if (patch.status === "done") {
      nextPatch.completedAt = existing.completedAt ?? new Date(now).toISOString();
    } else if (patch.status && existing.status === "done") {
      nextPatch.completedAt = null;
    }

    await ctx.db.patch(id, nextPatch);
    await ctx.db.insert("activityLog", {
      taskId: id,
      actionType: "updated",
      oldValue: JSON.stringify(existing),
      newValue: JSON.stringify(nextPatch),
      timestamp: now,
    });

    return id;
  },
});

export const updateTaskStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
    }

    if (args.status === "todo" || args.status === "doing") {
      const dependencies = await Promise.all(
        task.dependencyIds.map((dependencyId) => ctx.db.get(dependencyId)),
      );
      const missingDependencies = dependencies.filter(
        (dependency) => dependency && dependency.status !== "done",
      );

      if (missingDependencies.length > 0) {
        throw new ConvexError({
          code: "DEPENDENCIES_BLOCKED",
          message: "Esta tarefa ainda tem dependências por concluir.",
          missingDependencyIds: missingDependencies.map((dependency) => dependency!._id),
          missingDependencyTitles: missingDependencies.map((dependency) => dependency!.title),
        });
      }
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: args.status,
      completedAt:
        args.status === "done"
          ? task.completedAt ?? new Date(now).toISOString()
          : task.status === "done"
            ? null
            : task.completedAt,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      taskId: args.id,
      actionType: "status_changed",
      oldValue: task.status,
      newValue: args.status,
      timestamp: now,
    });

    return { ok: true, id: args.id, status: args.status };
  },
});

export const toggleDone = mutation({
  args: {
    id: v.id("tasks"),
    done: v.boolean(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      status: args.done ? "done" : "todo",
      completedAt: args.done ? new Date(now).toISOString() : null,
      updatedAt: now,
    });

    await ctx.db.insert("activityLog", {
      taskId: args.id,
      actionType: args.done ? "completed" : "reopened",
      oldValue: task.status,
      newValue: args.done ? "done" : "todo",
      timestamp: now,
    });

    return args.id;
  },
});

export const deleteTask = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const dependents = (await ctx.db.query("tasks").collect()).filter((task) =>
      task.dependencyIds.includes(args.id),
    );

    if (dependents.length > 0) {
      throw new ConvexError({
        code: "TASK_HAS_DEPENDENTS",
        message: "Esta tarefa bloqueia outras tarefas. Remova as dependências primeiro.",
      });
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const getDashboardData = query({
  args: {},
  handler: async (ctx) => {
    const [tasks, people, areas] = await Promise.all([
      ctx.db.query("tasks").collect(),
      ctx.db.query("people").collect(),
      ctx.db.query("areas").withIndex("by_order").collect(),
    ]);

    return { tasks, people, areas };
  },
});
