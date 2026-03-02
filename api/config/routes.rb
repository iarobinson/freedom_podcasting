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

  get  "/feeds/:podcast_slug",              to: "public/feeds#show",    format: :xml, as: :public_rss_feed
  get  "/feeds/:podcast_slug/episodes/:guid", to: "public/episodes#show", as: :public_episode

  namespace :public do
    get "/podcasts/:slug",          to: "podcasts#show"
    get "/podcasts/:slug/episodes", to: "podcasts#episodes"
  end
end
