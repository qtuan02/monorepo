import type { Meta, StoryObj } from "@storybook/react";
import { UserIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from "@monorepo/ui/components/combobox";

import { northwindPeople } from "~/support/people";
import { northwindProjects } from "~/support/projects";

const projectNames = northwindProjects.map((project) => project.name);

const peopleByRole = [
  { value: "Owner", items: northwindPeople.filter((p) => p.role === "Owner") },
  { value: "Admin", items: northwindPeople.filter((p) => p.role === "Admin") },
  {
    value: "Member",
    items: northwindPeople.filter((p) => p.role === "Member"),
  },
];

const meta = {
  title: "Storybook/Combobox",
  component: Combobox,
  subcomponents: {
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxGroup,
    ComboboxTrigger,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Combobox items={projectNames}>
      <ComboboxInput placeholder="Select a project" />
      <ComboboxContent>
        <ComboboxEmpty>No projects found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const CustomItems: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Combobox
      items={northwindPeople}
      itemToStringValue={(person: (typeof northwindPeople)[number]) =>
        person.name
      }
    >
      <ComboboxInput placeholder="Assign a teammate" />
      <ComboboxContent>
        <ComboboxEmpty>No one found.</ComboboxEmpty>
        <ComboboxList>
          {(person) => (
            <ComboboxItem key={person.id} value={person}>
              {person.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const WithGroupsAndSeparator: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Combobox items={peopleByRole}>
      <ComboboxInput placeholder="Find a teammate by role" />
      <ComboboxContent>
        <ComboboxEmpty>No teammates found.</ComboboxEmpty>
        <ComboboxList>
          {(group, index) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(person) => (
                  <ComboboxItem key={person.id} value={person}>
                    {person.name}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
              {index < peopleByRole.length - 1 && <ComboboxSeparator />}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Popup: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <Combobox items={northwindPeople} defaultValue={northwindPeople[0]}>
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            className="w-64 justify-between font-normal"
          >
            <UserIcon />
            <ComboboxValue />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput showTrigger={false} placeholder="Search teammates" />
        <ComboboxEmpty>No one found.</ComboboxEmpty>
        <ComboboxList>
          {(person) => (
            <ComboboxItem key={person.id} value={person}>
              {person.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};
