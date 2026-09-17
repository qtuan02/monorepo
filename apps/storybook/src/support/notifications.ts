export interface NorthwindNotification {
  id: string;
  personId: string;
  message: string;
  read: boolean;
}

export const northwindNotifications: NorthwindNotification[] = [
  {
    id: "n1",
    personId: "mira-okafor",
    message: "Tomás Reyes commented on Atlas",
    read: false,
  },
  {
    id: "n2",
    personId: "mira-okafor",
    message: "Invoice INV-2043 is overdue",
    read: false,
  },
  {
    id: "n3",
    personId: "mira-okafor",
    message: "Beacon onboarding reached 80%",
    read: true,
  },
];
