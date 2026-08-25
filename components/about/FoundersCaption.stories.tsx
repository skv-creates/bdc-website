import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { FoundersCaption } from "./FoundersCaption";

const founders = [
  {
    homeName: "Радина Донева",
    member: {
      name: "Radina Doneva",
      role: "Secretary / Co-founder",
      photo: "/figma/team/radina-doneva.png",
      bio: "Radina is a design researcher and a co-founder of the Bulgarian Design Council.",
    },
  },
  {
    homeName: "Добра Славкова",
    member: {
      name: "Dobra Slavkova",
      role: "Chair / Co-founder",
      photo: "/figma/team/dobra-slavkova.png",
      bio: "Dobra is a designer and a co-founder of the Bulgarian Design Council.",
    },
  },
  {
    homeName: "Стефи Пейкова Кришнан",
    member: {
      name: "Stefi Peykova Krishnan",
      role: "Deputy Chair / Co-founder",
      photo: "/figma/team/stefi-peykova-krishnan.png",
      bio: "Stefi is a systems thinker and a co-founder of the Bulgarian Design Council.",
    },
  },
] as const;

const meta = {
  component: FoundersCaption,
  parameters: { nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="bdc-grid mx-auto max-w-[1200px] px-6 pt-10">
        <Story />
      </div>
    ),
  ],
  args: {
    caption: [
      { text: "The co-founders of the BDC (left to right)\n" },
      { text: "Radina Doneva", bold: true, memberHomeName: "Радина Донева" },
      { text: ", " },
      { text: "Dobra Slavkova", bold: true, memberHomeName: "Добра Славкова" },
      { text: " and " },
      {
        text: "Stefka Peykova Krishnan",
        bold: true,
        memberHomeName: "Стефи Пейкова Кришнан",
      },
      { text: " (Stefi)" },
    ],
    founders: [...founders],
    bioPlaceholder: "Biography coming soon.",
    closeLabel: "Close",
  },
} satisfies Meta<typeof FoundersCaption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpensTheSharedBioAndReturnsFocus: Story = {
  play: async ({ canvas, userEvent }) => {
    const profiles = [
      { triggerName: "Radina Doneva", member: founders[0].member },
      { triggerName: "Dobra Slavkova", member: founders[1].member },
      // The caption uses Stefka while the profile and its Notion bio use Stefi.
      // This is the alias that previously made the third mapping easiest to miss.
      { triggerName: "Stefka Peykova Krishnan", member: founders[2].member },
    ];

    for (const [index, profile] of profiles.entries()) {
      const trigger = canvas.getByRole("button", { name: profile.triggerName });
      await userEvent.click(trigger);

      const dialog = await canvas.findByRole("dialog", { name: profile.member.name });
      await expect(dialog).toHaveTextContent(profile.member.bio);
      const close = canvas.getByRole("button", { name: "Close" });
      // The panel focuses Close in a passive effect — after paint, so the
      // assertion must wait for it like every other async step here does.
      await waitFor(() => expect(close).toHaveFocus());

      // Exercise both supported keyboard and pointer dismissal paths while
      // proving every founder returns the reader to the name they selected.
      if (index === 0) await userEvent.keyboard("{Escape}");
      else await userEvent.click(close);
      await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
      await waitFor(() => expect(trigger).toHaveFocus());
    }
  },
};
