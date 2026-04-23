import type {
  DerivedTaskState,
  Area,
  Person,
  Task,
  TaskWithRelations,
} from "@/types/renovation";

export function hydrateTasks(
  tasks: Task[],
  people: Person[],
  areas: Area[],
): TaskWithRelations[] {
  return tasks.map((task) => ({
    ...task,
    area: areas.find((area) => area._id === task.areaId),
    owner: people.find((person) => person._id === task.ownerId),
    allowedPeople: people.filter((person) =>
      task.allowedPersonIds.includes(person._id),
    ),
    dependencies: tasks.filter((dependency) =>
      task.dependencyIds.includes(dependency._id),
    ),
  }));
}

export function deriveTaskState(
  task: Task,
  allTasks: Task[],
  people: Person[],
): DerivedTaskState {
  const missingDependencies = allTasks.filter(
    (candidate) =>
      task.dependencyIds.includes(candidate._id) && candidate.status !== "done",
  );
  const canBeDoneBy = people.filter((person) =>
    task.allowedPersonIds.includes(person._id),
  );
  const owner = people.find((person) => person._id === task.ownerId);
  const isOwnerOnly =
    Boolean(owner && owner.role === "owner") &&
    task.allowedPersonIds.length === 1 &&
    task.allowedPersonIds[0] === task.ownerId;

  const blockedReasons: DerivedTaskState["blockedReasons"] = [];

  if (missingDependencies.length > 0) {
    blockedReasons.push({
      type: "dependency",
      label: `Depende de ${missingDependencies.length} tarefa(s) por terminar`,
      taskIds: missingDependencies.map((dependency) => dependency._id),
    });
  }

  if (task.requiresOwnerDecision && !task.ownerDecisionDone) {
    blockedReasons.push({
      type: "owner_decision",
      label: "Precisa de decisão da dona",
    });
  }

  if (task.materialNeeded && task.status === "waiting_material") {
    blockedReasons.push({
      type: "material",
      label: "À espera de material",
    });
  }

  if (task.status === "blocked") {
    blockedReasons.push({
      type: "manual",
      label: "Marcada manualmente como bloqueada",
    });
  }

  const isBlocked = blockedReasons.length > 0;

  return {
    isBlocked,
    missingDependencies,
    canStart: !isBlocked && task.status !== "done",
    canBeDoneBy,
    isOwnerOnly,
    blockedReasons,
  };
}
