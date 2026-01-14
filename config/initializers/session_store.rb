Rails.application.config.session_store :cookie_store,
  key: '_freedom_podcasting_session',
  same_site: :lax,
  secure: false