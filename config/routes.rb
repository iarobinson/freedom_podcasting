Rails.application.routes.draw do
  root to: 'pages#home'

  post "messages", to: "messages#create"
  get '/tools', to: 'pages#tools'
  get '/feed_flipper', to: 'pages#feed_flipper'
  get '/random_episode', to: 'pages#random_episode'
  get '/sync_all_podcast_feeds', to: "shows#sync_all_podcast_feeds"
  get '/immediate_add', to: "pages#immediate_add"

  devise_for :users do
    get '/users/sign_out' => 'devise/sessions#destroy'
  end

  resources :users
  resources :shows
  resources :shows, module: "shows" do
    resources :episodes
    get '/administrator_dashboard', to: "shows#administrator_dashboard"
  end
  
  get 'shows/:id/rss', to: 'feeds#show', as: :show_rss, defaults: { format: 'rss' }

  resources :invoices
  resources :episodes, only: [:index]
end
