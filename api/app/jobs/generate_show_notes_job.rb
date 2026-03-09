class GenerateShowNotesJob < ApplicationJob
  queue_as :ai_processing
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(episode_id)
    episode = Episode.find_by(id: episode_id)
    return unless episode&.transcript.present?

    episode.update_column(:show_notes_ai_status, "processing")

    duration_mins = episode.audio_duration_seconds ? (episode.audio_duration_seconds / 60.0).round(1) : nil
    duration_note = duration_mins ? "Episode duration: #{duration_mins} minutes.\n\n" : ""

    prompt = <<~PROMPT
      You are a podcast producer writing show notes for a podcast episode.

      #{duration_note}The transcript below has ACCURATE timestamps in [M:SS] format (one every ~30 seconds from the real audio). Use these exact timestamps when writing chapter markers — do NOT estimate or invent different ones.

      Transcript:
      #{episode.transcript}

      Write show notes in this exact format — no preamble, no commentary, just the show notes:

      First, write a 2-3 paragraph summary of the episode covering the main themes and key takeaways.

      Then write a "Chapters" section. Each line must reference a timestamp that actually appears in the transcript above. Format:
      - [M:SS] Brief description of what is discussed at this point

      Example output:
      In this episode, [host] discusses...

      [second paragraph]

      [optional third paragraph]

      Chapters:
      - [0:00] Introduction
      - [2:30] First major topic
      - [8:00] Deep dive into...
    PROMPT

    conn = Faraday.new("https://api.anthropic.com") do |f|
      f.request :json
      f.response :json
    end

    response = conn.post("/v1/messages") do |req|
      req.headers["x-api-key"]         = ENV.fetch("ANTHROPIC_API_KEY")
      req.headers["anthropic-version"] = "2023-06-01"
      req.body = {
        model:      "claude-sonnet-4-6",
        max_tokens: 1024,
        messages:   [{ role: "user", content: prompt }]
      }
    end

    content = response.body.dig("content", 0, "text")
    raise "No content returned from Claude (status: #{response.status}, body: #{response.body})" if content.blank?

    episode.update!(show_notes_ai: content, show_notes_ai_status: "done")
  rescue => e
    Episode.find_by(id: episode_id)&.update_column(:show_notes_ai_status, "failed")
    raise e
  end
end
