Rails.application.routes.draw do
  root to: 'pages#home'

  post "messages", to: "messages#create"
  get '/tools', to: 'pages#tools'
  get '/feed_flipper', to: 'pages#feed_flipper'
  get '/random_episode', to: 'pages#random_episode'
  get '/sync_all_podcast_feeds', to: "shows#sync_all_podcast_feeds"
  get '/immediate_add', to: "pages#immediate_add"

  devise_for :users, controllers: {
    sessions: 'users/sessions'
  }

  namespace :api do
    get '/current_user', to: 'current_user#show'
  end

  resources :users
  resources :shows
  resources :shows, module: "shows" do
    resources :episodes

    member do
      get 'feed', to: '/feeds#show', defaults: { format: 'xml' }
    end
  
    get '/administrator_dashboard', to: "shows#administrator_dashboard"
  end
  
  get 'shows/:id/rss', to: 'feeds#show', as: :show_rss, defaults: { format: 'rss' }

  resources :invoices
  resources :episodes, only: [:index]
end
