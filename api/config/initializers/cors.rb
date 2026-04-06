Rails.application.config.middleware.insert_before 0, Rack::Cors do
  # WordPress plugin API — allow any HTTPS origin (WordPress sites on any domain)
  allow do
    origins(->(source, _env) { source.start_with?("https://") || source == "null" })
    resource "/api/v1/wordpress/*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: false,
      max_age: 600
  end

  # FP app and internal origins
  allow do
    origins(
      "http://localhost:3001",
      "http://localhost:3000",
      /https:\/\/.*\.freedompodcasting\.com/,
      /https:\/\/.*\.fly\.dev/
    )
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ["Authorization"],
      credentials: false,
      max_age: 600
  end
end
