Rails.application.routes.draw do
  resources :episodes
  post "messages", to: "messages#create"
  resources :shows
  root to: 'pages#home'

  devise_for :users
  resources :pages, only: [:index]
  resources :administrator_dashboard, only: [:index]

  resources :shows, module: "shows" do
    resources :episodes
  end
end
