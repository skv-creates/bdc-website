import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import { AnalyticsConsent } from "./AnalyticsConsent";

const consent = {
  label: "Analytics cookie consent",
  text:
    "We use Google Analytics only with your consent. You can change your choice at any time.",
  accept: "Accept",
  decline: "Decline",
  settings: "Analytics settings",
  close: "Close",
  privacy: "Privacy policy",
};

const meta = {
  component: AnalyticsConsent,
  decorators: [
    (Story) => {
      localStorage.removeItem("bdc-analytics-consent");
      return <Story />;
    },
  ],
  args: {
    consent,
    collect: false,
    locale: "en",
    // A deliberately invalid test id makes the UI render. collect=false is
    // the stronger lock: the component must never create a Google request.
    measurementId: "G-TEST000000",
  },
} satisfies Meta<typeof AnalyticsConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CanGrantAndWithdrawWithoutNetwork: Story = {
  play: async ({ canvas, userEvent }) => {
    const panel = await canvas.findByRole("region", { name: consent.label });
    await expect(panel).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: consent.accept }));
    await expect(
      canvas.getByRole("button", { name: consent.settings }),
    ).toBeVisible();
    await expect(localStorage.getItem("bdc-analytics-consent")).toBe("granted");
    await expect(
      document.querySelector('script[src*="googletagmanager.com/gtag/js"]'),
    ).toBeNull();

    document.cookie = "_ga=test-cookie; Path=/";
    await userEvent.click(canvas.getByRole("button", { name: consent.settings }));
    await userEvent.click(canvas.getByRole("button", { name: consent.decline }));

    await expect(localStorage.getItem("bdc-analytics-consent")).toBe("denied");
    await waitFor(() => expect(document.cookie).not.toContain("_ga=test-cookie"));
    await expect(
      canvas.getByRole("button", { name: consent.settings }),
    ).toBeVisible();
  },
};
