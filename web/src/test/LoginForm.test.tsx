import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn(), back: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: vi.fn(),
}));

import LoginPage from "@/app/auth/login/page";
import { useAuthStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";

function makeAxiosError(status: number): AxiosError {
  const err = new AxiosError("error");
  Object.defineProperty(err, "response", { value: { status }, writable: true });
  return err;
}

describe("LoginForm", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    mockPush.mockClear();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, back: vi.fn() } as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>);
  });

  it("shows 'Invalid email or password' for a 401 response", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValueOnce(makeAxiosError(401));
    vi.mocked(useAuthStore).mockReturnValue({ login } as ReturnType<typeof useAuthStore>);

    render(<LoginPage />);
    await user.type(document.querySelector("input[type=email]")!, "wrong@test.com");
    await user.type(document.querySelector("input[type=password]")!, "badpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/unable to reach/i)).not.toBeInTheDocument();
  });

  it("shows 'Unable to reach the server' for a 500 response", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockRejectedValueOnce(makeAxiosError(500));
    vi.mocked(useAuthStore).mockReturnValue({ login } as ReturnType<typeof useAuthStore>);

    render(<LoginPage />);
    await user.type(document.querySelector("input[type=email]")!, "user@test.com");
    await user.type(document.querySelector("input[type=password]")!, "pass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/unable to reach the server/i)).toBeInTheDocument()
    );
    expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
  });

  it("redirects to /dashboard on successful login", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValueOnce(undefined);
    vi.mocked(useAuthStore).mockReturnValue({ login } as ReturnType<typeof useAuthStore>);

    render(<LoginPage />);
    await user.type(document.querySelector("input[type=email]")!, "user@test.com");
    await user.type(document.querySelector("input[type=password]")!, "correctpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows password-reset success banner when ?reset=1 is in URL", () => {
    const login = vi.fn();
    vi.mocked(useAuthStore).mockReturnValue({ login } as ReturnType<typeof useAuthStore>);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams("reset=1") as ReturnType<typeof useSearchParams>);

    render(<LoginPage />);
    expect(screen.getByText(/password updated/i)).toBeInTheDocument();
  });
});
