Rails.application.routes.draw do
  get "/health", to: proc { [200, {}, [{ status: "ok", version: "1.0.0" }.to_json]] }

  devise_for :users,
    path: "",
    path_names: {
      sign_in:      "api/v1/auth/login",
      sign_out:     "api/v1/auth/logout",
      registration: "api/v1/auth/register"
    },
    controllers: {
      sessions:      "api/v1/auth/sessions",
      registrations: "api/v1/auth/registrations"
    }

  namespace :api do
    namespace :v1 do
      namespace :auth do
        get  "me",       to: "me#show"
        post "password", to: "passwords#create"
        put  "password", to: "passwords#update"
      end

      resources :organizations, param: :slug do
        member do
          get    :members
          post   :invite
          delete "members/:user_id",      to: "organizations#remove_member"
          patch  "members/:user_id/role", to: "organizations#update_member_role"
          post   "billing/checkout",      to: "billing#checkout"
          post   "billing/portal",        to: "billing#portal"
          post   "billing/cancel",        to: "billing#cancel"
        end

        resources :podcasts, param: :slug do
          member do
            post :publish
            post :unpublish
          end

          resources :episodes do
            member do
              post :publish
              post :unpublish
              post :submit_for_review
              post :approve
              post :reject
              post :transcribe
              post :generate_show_notes
            end
          end

          resources :uploads, only: [] do
            collection do
              post :presign
              post :complete
            end
          end
        end
      end

      resources :invitations, only: [] do
        collection { post :accept }
      end

      resources :memberships, only: [:index, :destroy]
    end
  end

  post "/stripe/webhooks", to: "stripe_webhooks#receive"

  # Org-scoped (canonical, unambiguous)
  get  "/feeds/:org_slug/:podcast_slug",                    to: "public/feeds#show_scoped",    format: :xml, as: :public_rss_feed_scoped
  get  "/feeds/:org_slug/:podcast_slug/episodes/:guid",     to: "public/episodes#show_scoped", as: :public_episode_scoped

  # Legacy slug-only (backward-compat for existing RSS subscribers)
  get  "/feeds/:podcast_slug",                              to: "public/feeds#show",    format: :xml, as: :public_rss_feed
  get  "/feeds/:podcast_slug/episodes/:guid",               to: "public/episodes#show", as: :public_episode

  namespace :public do
    # Org-scoped (canonical) — unambiguous in multi-tenant
    get "/podcasts/:org_slug/:podcast_slug",                         to: "podcasts#show"
    get "/podcasts/:org_slug/:podcast_slug/episodes",                to: "podcasts#episodes"
    get "/podcasts/:org_slug/:podcast_slug/episodes/:episode_id",    to: "podcasts#episode"

    # Legacy slug-only routes — kept for backward-compat
    get "/podcasts/:slug",                                           to: "podcasts#show_legacy"
    get "/podcasts/:slug/episodes",                                  to: "podcasts#episodes_legacy"
    get "/podcasts/:slug/episodes/:episode_id",                      to: "podcasts#episode_legacy"
  end
end
