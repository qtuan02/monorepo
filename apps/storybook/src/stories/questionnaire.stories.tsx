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
  tags: ["autodocs"],
} satisfies Meta<typeof Questionnaire>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <Questionnaire className="w-full max-w-sm">
      <QuestionnaireProgress />
      <QuestionnaireItem name="role">
        <QuestionnaireTitle>What is your role?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Choose the option that best describes you.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="developer">Developer</QuestionnaireChoice>
          <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
          <QuestionnaireChoice value="manager">Manager</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="feedback" required={false}>
        <QuestionnaireTitle>Anything else to share?</QuestionnaireTitle>
        <QuestionnaireInput placeholder="Optional feedback" />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  ),
};
