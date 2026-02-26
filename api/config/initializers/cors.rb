Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      "http://localhost:3001",
      "http://localhost:3000",
      /https:\/\/.*\.freedompodcasting\.com/,
      ENV.fetch("FRONTEND_URL", "")
    )

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ["Authorization"],
      credentials: false,
      max_age: 600
  end
end
