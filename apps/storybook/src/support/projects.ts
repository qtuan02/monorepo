export interface NorthwindProject {
  id: string;
  name: string;
  summary: string;
  ownerId: string;
}

// Named separately from the list below so a story that just needs "the
// project" (most of them do) can import it without indexing an array.
export const atlasProject: NorthwindProject = {
  id: "atlas",
  name: "Atlas",
  summary: "Billing migration",
  ownerId: "mira-okafor",
};

// Northwind's four active projects — the "content" most compound stories
// (cards, tables, dialogs) are staged around.
export const northwindProjects: NorthwindProject[] = [
  atlasProject,
  {
    id: "beacon",
    name: "Beacon",
    summary: "Onboarding revamp",
    ownerId: "tomas-reyes",
  },
  {
    id: "comet",
    name: "Comet",
    summary: "Mobile app",
    ownerId: "hana-sato",
  },
  {
    id: "delta",
    name: "Delta",
    summary: "Design system",
    ownerId: "priya-raman",
  },
];
