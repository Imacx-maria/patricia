import type { Id } from "@/convex/_generated/dataModel";
import { deriveTaskState } from "@/lib/taskLogic";
import type { Person, TaskStatus, TaskWithRelations } from "@/types/renovation";

export type TaskFilters = {
  search: string;
  area: string;
  personId: string;
  status: TaskStatus | "all";
  mine: boolean;
  blocked: boolean;
  waitingMaterial: boolean;
};

export const defaultTaskFilters: TaskFilters = {
  search: "",
  area: "all",
  personId: "all",
  status: "all",
  mine: false,
  blocked: false,
  waitingMaterial: false,
};

export function readSavedTaskFilters(storageKey: string) {
  if (typeof window === "undefined") return defaultTaskFilters;

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return defaultTaskFilters;
    return { ...defaultTaskFilters, ...JSON.parse(saved) } as TaskFilters;
  } catch {
    return defaultTaskFilters;
  }
}

export function taskMatchesFilters({
  task,
  filters,
  allTasks,
  people,
  currentPersonId,
}: {
  task: TaskWithRelations;
  filters: TaskFilters;
  allTasks: TaskWithRelations[];
  people: Person[];
  currentPersonId: string;
}) {
  const query = filters.search.trim().toLocaleLowerCase("pt-PT");
  const derived = deriveTaskState(task, allTasks, people);

  if (query) {
    const haystack = [
      task.title,
      task.description,
      task.notes,
      task.area?.name,
      task.owner?.name,
      ...task.allowedPeople.map((person) => person.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("pt-PT");

    if (!haystack.includes(query)) return false;
  }

  if (filters.area !== "all" && task.area?.name !== filters.area) return false;
  if (
    filters.personId !== "all" &&
    task.ownerId !== filters.personId &&
    !task.allowedPersonIds.includes(filters.personId as Id<"people">)
  ) {
    return false;
  }
  if (filters.status !== "all" && task.status !== filters.status) return false;
  if (
    currentPersonId &&
    task.ownerId !== currentPersonId &&
    !task.allowedPersonIds.includes(currentPersonId as Id<"people">)
  ) {
    return false;
  }
  if (
    filters.mine &&
    (!currentPersonId ||
      (task.ownerId !== currentPersonId &&
        !task.allowedPersonIds.includes(currentPersonId as Id<"people">)))
  ) {
    return false;
  }
  if (filters.blocked && !derived.isBlocked) return false;
  if (filters.waitingMaterial && !task.materialNeeded && task.status !== "waiting_material") return false;

  return true;
}

export function filterTasks({
  tasks,
  filters,
  people,
  currentPersonId,
}: {
  tasks: TaskWithRelations[];
  filters: TaskFilters;
  people: Person[];
  currentPersonId: string;
}) {
  return tasks.filter((task) =>
    taskMatchesFilters({
      task,
      filters,
      allTasks: tasks,
      people,
      currentPersonId,
    }),
  );
}
