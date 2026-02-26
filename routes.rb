Rails.application.routes.draw do
  # Health check
  get "/health", to: proc { [200, {}, [{ status: "ok", version: "1.0.0" }.to_json]] }

  # Devise JWT auth routes
  devise_for :users,
    path: "",
    path_names: {
      sign_in: "api/v1/auth/login",
      sign_out: "api/v1/auth/logout",
      registration: "api/v1/auth/register"
    },
    controllers: {
      sessions: "api/v1/auth/sessions",
      registrations: "api/v1/auth/registrations"
    }

  namespace :api do
    namespace :v1 do
      # Auth
      namespace :auth do
        get "me", to: "sessions#me"
      end

      # Organizations
      resources :organizations, param: :slug do
        member do
          get :members
          post :invite
          delete "members/:user_id", to: "organizations#remove_member"
        end

        # Podcasts (scoped to org)
        resources :podcasts, param: :slug do
          member do
            get :rss, format: :xml  # The RSS feed
            post :publish
            post :unpublish
          end

          # Episodes
          resources :episodes do
            member do
              post :publish
              post :unpublish
            end
          end

          # Upload
          resources :uploads, only: [:create] do
            collection do
              post :presign  # Get presigned URL for direct R2 upload
              post :complete  # Notify server upload is done
            end
          end
        end
      end

      # Current user's orgs shortcut
      resources :memberships, only: [:index, :destroy]
    end
  end

  # Public RSS feed (no auth required) — canonical URL
  get "/feeds/:podcast_slug", to: "public/feeds#show", format: :xml, as: :public_rss_feed
  get "/feeds/:podcast_slug/episodes/:guid", to: "public/episodes#show", as: :public_episode

  # Public podcast page data
  namespace :public do
    get "/podcasts/:slug", to: "podcasts#show"
    get "/podcasts/:slug/episodes", to: "podcasts#episodes"
  end
end
