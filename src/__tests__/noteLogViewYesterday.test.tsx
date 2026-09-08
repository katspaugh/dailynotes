// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { NoteLogView } from "../components/NoteLog/NoteLogView";
import { ok } from "../domain/result";
import { formatDate } from "../utils/date";

vi.mock("../contexts/weatherContext", () => ({
  useWeatherContext: () => ({
    state: { showWeather: false, dailyWeather: null },
    formatWeatherLabel: () => null,
  }),
}));

vi.mock("../contexts/noteRepositoryContext", () => ({
  useNoteRepositoryContext: () => ({
    imageRepository: {
      upload: vi.fn(),
      get: vi.fn().mockResolvedValue(ok(null)),
      getUrl: vi.fn().mockResolvedValue(ok(null)),
      delete: vi.fn().mockResolvedValue(ok(undefined)),
      getByNoteDate: vi.fn().mockResolvedValue(ok([])),
      deleteByNoteDate: vi.fn().mockResolvedValue(ok(undefined)),
    },
    weather: null,
    noteSections: new Map(),
  }),
}));

vi.mock("../contexts/routingContext", () => ({
  useRoutingContext: () => ({ navigateToDate: vi.fn() }),
}));

const ENTRY =
  '<hr data-timestamp="2024-06-14T08:13:00.000Z" data-label="8:13 AM" contenteditable="false">Slept badly.';

function yesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

describe("NoteLogView for yesterday", () => {
  it("renders the timeline with the composer and editable entries", () => {
    const utils = render(
      <NoteLogView
        date={yesterdayString()}
        content={ENTRY}
        onChange={vi.fn()}
        isContentReady={true}
      />,
    );

    expect(utils.getByLabelText("New entry")).toBeTruthy();
    expect(utils.queryByText("Read-only")).toBeNull();
    const entry = utils.container.querySelector(
      "[data-moment-time] [role=\"textbox\"]",
    );
    expect(entry?.getAttribute("data-readonly")).toBeNull();
  });

  it("stays read-only for older days", () => {
    const utils = render(
      <NoteLogView
        date="01-01-2020"
        content={ENTRY}
        onChange={vi.fn()}
        isContentReady={true}
        readOnly
      />,
    );

    expect(utils.queryByLabelText("New entry")).toBeNull();
    const entry = utils.container.querySelector(
      "[data-moment-time] [role=\"textbox\"]",
    );
    expect(entry?.getAttribute("data-readonly")).toBe("true");
  });
});
