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

      #{duration_note}Transcript:
      #{episode.transcript}

      Write show notes in this exact format — no preamble, no commentary, just the show notes:

      First, write a 2-3 paragraph summary of the episode covering the main themes and key takeaways.

      Then write a "Key Topics" section with timestamped bullet points. Estimate each timestamp based on where the topic appears in the transcript relative to the total episode duration. Format each line as:
      - [M:SS] Brief description of the topic

      Example output format:
      In this episode, [host] discusses...

      [second paragraph]

      [optional third paragraph]

      Key Topics:
      - [0:30] Introduction and background
      - [3:15] First major topic
      - [8:45] Second major topic
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
