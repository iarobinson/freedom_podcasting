Rails.application.routes.draw do
  resources :episodes
  post "messages", to: "messages#create"
  root to: 'pages#home'

  devise_for :users do
    get '/users/sign_out' => 'devise/sessions#destroy'
  end
  resources :users
  resources :pages
  resources :administrator_dashboard, only: [:index]

  resources :shows
  resources :shows, module: "shows" do
    resources :episodes
  end
end
