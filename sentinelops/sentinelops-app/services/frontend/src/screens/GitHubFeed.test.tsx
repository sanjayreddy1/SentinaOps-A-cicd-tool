import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import GitHubFeed from "./GitHubFeed";

class MockEventSource {
  static instances: MockEventSource[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GitHub realtime feed", () => {
  it("opens the SSE stream and renders live webhook events", async () => {
    render(<GitHubFeed />);

    expect(screen.getByText(/waiting for github events/i)).toBeInTheDocument();
    const source = MockEventSource.instances[0];
    expect(source.url).toContain("/api/github/events");

    await act(async () => source.onopen?.());
    expect(screen.getByText("Live")).toBeInTheDocument();

    await act(async () => {
      source.onmessage?.({
        data: JSON.stringify({
          id: "evt-1",
          type: "push",
          repo: "acme/sentinelops",
          actor: "octocat",
          summary: "2 commit(s) pushed to main",
          url: null,
          received_at: "2026-01-01T00:00:00Z",
        }),
      });
    });

    expect(screen.getByText("2 commit(s) pushed to main")).toBeInTheDocument();
    expect(screen.getByText("acme/sentinelops")).toBeInTheDocument();
    expect(screen.getByText("by octocat")).toBeInTheDocument();
  });

  it("closes the connection on unmount", () => {
    const { unmount } = render(<GitHubFeed />);
    const source = MockEventSource.instances[0];
    unmount();
    expect(source.closed).toBe(true);
  });
});
