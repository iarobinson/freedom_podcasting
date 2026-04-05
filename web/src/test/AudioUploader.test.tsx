import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/api", () => ({
  uploadsApi: {
    presign:    vi.fn(),
    uploadToR2: vi.fn(),
    complete:   vi.fn(),
  },
}));

import { AudioUploader } from "@/components/upload/AudioUploader";
import { uploadsApi } from "@/lib/api";

const PRESIGN_RESPONSE = {
  data: {
    data: {
      presigned_url: "https://r2.example.com/upload",
      media_file_id: 42,
      r2_key: "audio/ep.mp3",
      expires_in: 3600,
    },
  },
};

const COMPLETE_RESPONSE = {
  data: { data: { media_file_id: 42, public_url: "https://cdn.example.com/ep.mp3" } },
};

const DEFAULT_PROPS = {
  orgSlug: "org",
  podcastSlug: "show",
  onUploadComplete: vi.fn(),
  onError: vi.fn(),
};

describe("AudioUploader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-audio files and shows error without calling presign", async () => {
    // applyAccept: false bypasses the browser-level accept filter so the JS
    // MIME type check in the handler is actually exercised
    const user = userEvent.setup({ applyAccept: false });
    render(<AudioUploader {...DEFAULT_PROPS} />);

    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    const badFile = new File(["content"], "video.mp4", { type: "video/mp4" });
    await user.upload(input, badFile);

    await waitFor(() =>
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/unsupported type/i)).toBeInTheDocument();
    expect(DEFAULT_PROPS.onError).toHaveBeenCalledWith(expect.stringMatching(/unsupported type/i));
    expect(uploadsApi.presign).not.toHaveBeenCalled();
  });

  it("rejects files over 500MB", async () => {
    const user = userEvent.setup();
    render(<AudioUploader {...DEFAULT_PROPS} />);

    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    const bigFile = new File(["x"], "big.mp3", { type: "audio/mpeg" });
    Object.defineProperty(bigFile, "size", { value: 501 * 1024 * 1024 });
    await user.upload(input, bigFile);

    await waitFor(() =>
      expect(screen.getByText(/too large/i)).toBeInTheDocument()
    );
    expect(uploadsApi.presign).not.toHaveBeenCalled();
  });

  it("calls presign with correct params for a valid audio file", async () => {
    const user = userEvent.setup();
    vi.mocked(uploadsApi.presign).mockResolvedValueOnce(PRESIGN_RESPONSE as never);
    vi.mocked(uploadsApi.uploadToR2).mockResolvedValueOnce(undefined);
    vi.mocked(uploadsApi.complete).mockResolvedValueOnce(COMPLETE_RESPONSE as never);

    render(<AudioUploader {...DEFAULT_PROPS} />);

    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    await user.upload(input, new File(["audio"], "ep.mp3", { type: "audio/mpeg" }));

    await waitFor(() =>
      expect(uploadsApi.presign).toHaveBeenCalledWith("org", "show", {
        filename: "ep.mp3",
        content_type: "audio/mpeg",
        upload_type: "audio",
      })
    );
  });

  it("shows upload progress percentage in the UI", async () => {
    const user = userEvent.setup();
    vi.mocked(uploadsApi.presign).mockResolvedValueOnce(PRESIGN_RESPONSE as never);

    let capturedOnProgress: ((pct: number) => void) | undefined;
    vi.mocked(uploadsApi.uploadToR2).mockImplementationOnce(
      async (_url: string, _file: File, onProgress?: (pct: number) => void) => {
        capturedOnProgress = onProgress;
        await new Promise(() => {}); // never resolves — stay in uploading state
      }
    );

    render(<AudioUploader {...DEFAULT_PROPS} />);

    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    await user.upload(input, new File(["audio"], "ep.mp3", { type: "audio/mpeg" }));

    await waitFor(() => expect(capturedOnProgress).toBeDefined());
    act(() => capturedOnProgress!(60));

    await waitFor(() =>
      expect(screen.getByText(/uploading 60%/i)).toBeInTheDocument()
    );
  });

  it("calls onUploadComplete with mediaFileId and publicUrl on success", async () => {
    const user = userEvent.setup();
    vi.mocked(uploadsApi.presign).mockResolvedValueOnce(PRESIGN_RESPONSE as never);
    vi.mocked(uploadsApi.uploadToR2).mockResolvedValueOnce(undefined);
    vi.mocked(uploadsApi.complete).mockResolvedValueOnce(COMPLETE_RESPONSE as never);

    render(<AudioUploader {...DEFAULT_PROPS} />);

    const input = document.querySelector("input[type=file]") as HTMLInputElement;
    await user.upload(input, new File(["audio"], "ep.mp3", { type: "audio/mpeg" }));

    await waitFor(() =>
      expect(DEFAULT_PROPS.onUploadComplete).toHaveBeenCalledWith({
        mediaFileId: 42,
        publicUrl: "https://cdn.example.com/ep.mp3",
      })
    );
    expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
  });
});
