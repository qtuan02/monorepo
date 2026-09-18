import type { Meta, StoryObj } from "@storybook/react";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@monorepo/ui/components/questionnaire";

const meta = {
  title: "Storybook/Questionnaire",
  component: Questionnaire,
  subcomponents: {
    QuestionnaireProgress,
    QuestionnaireItem,
    QuestionnaireTitle,
    QuestionnaireDescription,
    QuestionnaireChoices,
    QuestionnaireChoice,
    QuestionnaireInput,
    QuestionnaireActions,
    QuestionnairePrevious,
    QuestionnaireNext,
    QuestionnaireSubmit,
  },
  tags: ["autodocs"],
  parameters: { stage: { width: "sm" } },
} satisfies Meta<typeof Questionnaire>;

export default meta;

type Story = StoryObj<typeof meta>;

// The feedback survey the Northwind Assistant sends once it has resolved
// Mira's request — see message-scroller.stories.tsx for that conversation.
export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Questionnaire className="w-full">
      <QuestionnaireProgress />
      <QuestionnaireItem name="rating">
        <QuestionnaireTitle>How did Northwind Assistant do?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Pick the option that best fits this chat.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="great">Great</QuestionnaireChoice>
          <QuestionnaireChoice value="okay">Okay</QuestionnaireChoice>
          <QuestionnaireChoice value="not-great">Not great</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="notes" required={false}>
        <QuestionnaireTitle>Anything else to share?</QuestionnaireTitle>
        <QuestionnaireInput placeholder="Optional notes for the team" />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  ),
};
