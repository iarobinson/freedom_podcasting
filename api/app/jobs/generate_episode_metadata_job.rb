class GenerateEpisodeMetadataJob < ApplicationJob
  queue_as :ai_processing
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  def perform(episode_id)
    episode = Episode.find_by(id: episode_id)
    return unless episode&.transcript.present?

    episode.update_column(:ai_metadata_status, "processing")

    duration_mins = episode.audio_duration_seconds ? (episode.audio_duration_seconds / 60.0).round(1) : nil
    duration_note = duration_mins ? "Episode duration: #{duration_mins} minutes.\n\n" : ""

    prompt = <<~PROMPT
      You are a podcast producer. Given the transcript below, write episode metadata.

      #{duration_note}The transcript has ACCURATE timestamps in [M:SS] format (one every ~30 seconds from the real audio). Use these exact timestamps when writing chapter markers — do NOT estimate or invent different ones.

      Transcript:
      #{episode.transcript}

      Reply in this EXACT format using ||| as separators — no preamble, no extra text:

      TITLE|||A compelling episode title (max 80 characters)|||DESCRIPTION|||2-3 paragraphs describing the episode, followed by a blank line and then a chapter list using ONLY timestamps that appear in the transcript above, formatted as:
      [M:SS] Chapter title
      [M:SS] Chapter title
      |||SUMMARY|||One sentence summary for podcast apps (max 160 characters)
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

    raw = response.body.dig("content", 0, "text")
    raise "No content returned from Claude (status: #{response.status})" if raw.blank?

    parts = raw.split("|||")
    title_idx       = parts.index("TITLE")
    desc_idx        = parts.index("DESCRIPTION")
    summary_idx     = parts.index("SUMMARY")

    raise "Unexpected response format from Claude: #{raw[0..200]}" unless title_idx && desc_idx && summary_idx

    title       = parts[title_idx + 1]&.strip
    description = parts[desc_idx + 1]&.strip
    summary     = parts[summary_idx + 1]&.strip

    raise "Missing required fields in Claude response" if title.blank? || description.blank?

    episode.update!(
      title:             title,
      description:       description,
      summary:           summary.presence,
      ai_metadata_status: "done"
    )
  rescue => e
    Episode.find_by(id: episode_id)&.update_column(:ai_metadata_status, "failed")
    raise e
  end
end
