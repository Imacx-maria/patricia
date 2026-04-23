import type { Doc, Id } from "@/convex/_generated/dataModel";

export type PersonRole = "owner" | "worker" | "other";
export type TaskStatus =
  | "backlog"
  | "todo"
  | "doing"
  | "blocked"
  | "waiting_material"
  | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type CostCategory =
  | "materials"
  | "labor"
  | "tools"
  | "furniture"
  | "decoration"
  | "other";

export type Person = Doc<"people">;
export type Area = Doc<"areas">;
export type Task = Doc<"tasks">;

export type TaskWithRelations = Task & {
  area?: Area;
  owner?: Person;
  allowedPeople: Person[];
  dependencies: Task[];
};

export type BlockedReasonType =
  | "dependency"
  | "owner_decision"
  | "material"
  | "manual";

export type BlockedReason = {
  type: BlockedReasonType;
  label: string;
  taskIds?: Id<"tasks">[];
};

export type DerivedTaskState = {
  isBlocked: boolean;
  missingDependencies: Task[];
  canStart: boolean;
  canBeDoneBy: Person[];
  isOwnerOnly: boolean;
  blockedReasons: BlockedReason[];
};

export type AttachmentKind = "option" | "progress" | "inspiration";

export type Attachment = {
  _id: string;
  taskId: string;
  storageId: string;
  kind: AttachmentKind;
  caption?: string;
  price?: number | null;
  sourceUrl?: string;
  mimeType?: string;
  createdAt: number;
  url: string | null;
};
