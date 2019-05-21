Rails.application.routes.draw do
  resources :shows
  root to: 'pages#home'

  devise_for :users
  resources :pages, only: [:index]

  resources :users do
    resources :dashboard, only: [:index]
  end
end
