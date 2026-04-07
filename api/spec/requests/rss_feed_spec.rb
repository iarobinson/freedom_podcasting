require "rails_helper"

RSpec.describe "RSS Feed", type: :request do
  let(:org)     { create(:organization) }
  let(:podcast) { create(:podcast, organization: org, published: true, published_at: 1.day.ago, podcast_type: "episodic", explicit: false, category: "Technology") }
  let!(:episode1) { create(:episode, :published, podcast: podcast, episode_number: 1, title: "Episode One", explicit: false) }
  let!(:episode2) { create(:episode, :published, podcast: podcast, episode_number: 2, title: "Episode Two", explicit: true) }
  let!(:draft_episode) { create(:episode, podcast: podcast, status: "draft", title: "Draft Episode") }

  subject { get "/feeds/#{podcast.rss_token}", headers: { "Accept" => "application/xml" } }

  # ── Basic validity ────────────────────────────────────────────────────────────

  it "returns 200" do
    subject
    expect(response).to have_http_status(:ok)
  end

  it "returns RSS+XML content type" do
    subject
    expect(response.content_type).to include("application/rss+xml")
  end

  it "is valid XML" do
    subject
    expect { Nokogiri::XML(response.body) { |c| c.strict } }.not_to raise_error
  end

  it "is RSS 2.0 with iTunes namespace" do
    subject
    expect(response.body).to include('version="2.0"')
    expect(response.body).to include('xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"')
  end

  # ── Channel-level required tags (Apple Podcasts spec) ─────────────────────────

  it "includes podcast title" do
    subject
    expect(response.body).to include("<title>#{podcast.title}</title>")
  end

  it "includes podcast description" do
    subject
    expect(response.body).to include(podcast.description)
  end

  it "includes language" do
    subject
    expect(response.body).to include("<language>#{podcast.language}</language>")
  end

  it "includes itunes:author" do
    subject
    expect(response.body).to include("<itunes:author>#{podcast.author}</itunes:author>")
  end

  it "includes itunes:owner with name and email" do
    subject
    expect(response.body).to include("<itunes:name>#{podcast.author}</itunes:name>")
    expect(response.body).to include("<itunes:email>#{podcast.email}</itunes:email>")
  end

  it "includes itunes:explicit on the channel" do
    subject
    expect(response.body).to include("<itunes:explicit>false</itunes:explicit>")
  end

  it "includes itunes:type matching the podcast type" do
    subject
    expect(response.body).to include("<itunes:type>episodic</itunes:type>")
  end

  it "includes itunes:category" do
    subject
    expect(response.body).to include('itunes:category')
    expect(response.body).to include("Technology")
  end

  it "includes atom:link self reference" do
    subject
    expect(response.body).to include('rel="self"')
    expect(response.body).to include('type="application/rss+xml"')
  end

  # ── Episode visibility ────────────────────────────────────────────────────────

  it "includes only published episodes" do
    subject
    expect(response.body).to include("Episode One")
    expect(response.body).to include("Episode Two")
    expect(response.body).not_to include(draft_episode.title)
  end

  # ── Episode-level required tags ───────────────────────────────────────────────

  it "includes immutable GUIDs with isPermaLink=false" do
    subject
    expect(response.body).to include(%(<guid isPermaLink="false">#{episode1.guid}</guid>))
    expect(response.body).to include(%(<guid isPermaLink="false">#{episode2.guid}</guid>))
  end

  it "includes pubDate for published episodes" do
    subject
    expect(response.body).to include("<pubDate>")
  end

  it "includes itunes:explicit per episode" do
    subject
    # episode1 is not explicit, episode2 is
    doc = Nokogiri::XML(response.body)
    doc.remove_namespaces!
    items = doc.xpath("//item")
    titles = items.map { |i| i.at_xpath("title")&.text }
    ep1_node = items[titles.index("Episode One")]
    ep2_node = items[titles.index("Episode Two")]
    expect(ep1_node.at_xpath("explicit")&.text).to eq("false")
    expect(ep2_node.at_xpath("explicit")&.text).to eq("true")
  end

  it "includes itunes:episodeType per episode" do
    subject
    expect(response.body).to include("<itunes:episodeType>full</itunes:episodeType>")
  end

  it "includes itunes:duration for episodes with audio" do
    subject
    expect(response.body).to include("<itunes:duration>")
  end

  it "includes content:encoded for each episode" do
    subject
    expect(response.body).to include("content:encoded")
  end

  # ── Enclosure ─────────────────────────────────────────────────────────────────

  it "includes enclosure tags" do
    subject
    expect(response.body).to include("<enclosure")
  end

  it "enclosure URL routes through the streaming endpoint using episode id" do
    subject
    # Enclosure URLs must use the integer episode ID — never the guid, which
    # can be an arbitrary URL for imported episodes (e.g. https://site.com/?p=123).
    expect(response.body).to include("episodes/#{episode1.id}")
    expect(response.body).not_to include("episodes/#{episode1.guid}")
  end

  it "enclosure URL is a valid URL with no embedded protocol (guards against imported URL-style guids)" do
    subject
    doc = Nokogiri::XML(response.body)
    doc.remove_namespaces!
    doc.xpath("//enclosure").each do |enc|
      url = enc["url"]
      # A URL with a guid embedded as a path segment would look like
      # .../episodes/https://... — the double-protocol is the tell.
      expect(url).not_to match(%r{episodes/https?://})
      expect(url).to start_with("http")
      # Must be parseable
      expect { URI.parse(url) }.not_to raise_error
    end
  end

  it "enclosure URL works even when episode guid is a WordPress-style URL" do
    wp_episode = create(:episode, :published, podcast: podcast,
                        guid: "https://example.com/?p=9999")
    subject
    doc = Nokogiri::XML(response.body)
    doc.remove_namespaces!
    enclosures = doc.xpath("//enclosure").map { |e| e["url"] }
    wp_enc = enclosures.find { |u| u.include?("episodes/#{wp_episode.id}") }
    expect(wp_enc).to be_present
    expect(wp_enc).not_to include("https://example.com")
    expect { URI.parse(wp_enc) }.not_to raise_error
  end

  it "enclosure has length and type attributes" do
    subject
    doc = Nokogiri::XML(response.body)
    doc.remove_namespaces!
    enclosures = doc.xpath("//enclosure")
    expect(enclosures).not_to be_empty
    enclosures.each do |enc|
      expect(enc["length"].to_i).to be >= 0
      expect(enc["type"]).to match(/\Aaudio\//)
    end
  end

  # ── Error cases ───────────────────────────────────────────────────────────────

  it "returns 404 for an unpublished podcast" do
    podcast.update!(published: false)
    subject
    expect(response).to have_http_status(:not_found)
  end

  it "returns 404 for a nonexistent slug" do
    get "/feeds/nonexistent-podcast-slug"
    expect(response).to have_http_status(:not_found)
  end

  # ── URL scheme ────────────────────────────────────────────────────────────────

  it "feed URL in the XML uses the rss_token (not the org slug)" do
    subject
    expect(response.body).to include("/feeds/#{podcast.rss_token}")
    expect(response.body).not_to include(org.slug)
  end

  it "enclosure URLs use the rss_token (not the org slug or guid)" do
    subject
    expect(response.body).to include("/feeds/#{podcast.rss_token}/episodes/#{episode1.id}")
    expect(response.body).not_to include("#{org.slug}/#{podcast.slug}/episodes")
    expect(response.body).not_to include("episodes/#{episode1.guid}")
  end

  it "serves the feed by legacy slug for backward compatibility" do
    get "/feeds/#{podcast.slug}"
    expect(response).to have_http_status(:ok)
  end

  it "redirects org-scoped URL to canonical token URL with 301" do
    get "/feeds/#{org.slug}/#{podcast.slug}"
    expect(response).to have_http_status(:moved_permanently)
    expect(response.location).to include("/feeds/#{podcast.rss_token}")
  end
end
