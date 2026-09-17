export type NorthwindRole = "Owner" | "Admin" | "Member" | "Viewer";

export interface NorthwindPerson {
  id: string;
  name: string;
  email: string;
  role: NorthwindRole;
  initials: string;
}

// The "you" of most stories — the Northwind member a Default story is written
// from the point of view of.
export const currentPerson: NorthwindPerson = {
  id: "mira-okafor",
  name: "Mira Okafor",
  email: "mira@northwind.dev",
  role: "Owner",
  initials: "MO",
};

// The Northwind cast every story in this workshop draws its copy from — edit
// here, and every story that imports a person picks up the change.
export const northwindPeople: NorthwindPerson[] = [
  currentPerson,
  {
    id: "tomas-reyes",
    name: "Tomás Reyes",
    email: "tomas@northwind.dev",
    role: "Admin",
    initials: "TR",
  },
  {
    id: "hana-sato",
    name: "Hana Sato",
    email: "hana@northwind.dev",
    role: "Admin",
    initials: "HS",
  },
  {
    id: "liam-bennett",
    name: "Liam Bennett",
    email: "liam@northwind.dev",
    role: "Member",
    initials: "LB",
  },
  {
    id: "priya-raman",
    name: "Priya Raman",
    email: "priya@northwind.dev",
    role: "Member",
    initials: "PR",
  },
  {
    id: "noah-kessler",
    name: "Noah Kessler",
    email: "noah@northwind.dev",
    role: "Member",
    initials: "NK",
  },
  {
    id: "yara-haddad",
    name: "Yara Haddad",
    email: "yara@northwind.dev",
    role: "Member",
    initials: "YH",
  },
  {
    id: "elin-berg",
    name: "Elin Berg",
    email: "elin@northwind.dev",
    role: "Viewer",
    initials: "EB",
  },
];
