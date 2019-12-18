Rails.application.routes.draw do

  post "messages", to: "messages#create"
  root to: 'pages#home'
  get '/tools', to: 'pages#tools'
  get '/feed_flipper', to: 'pages#feed_flipper'
  get '/random_episode', to: 'pages#random_episode'

  devise_for :users do
    get '/users/sign_out' => 'devise/sessions#destroy'
  end
  resources :users
  resources :shows
  resources :shows, module: "shows" do
    resources :episodes
  end

  resources :dashboard, only: [:index]
  resources :invoices
  resources :episodes, only: [:index]
end
