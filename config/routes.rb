Rails.application.routes.draw do

  resources :feeds
  post "messages", to: "messages#create"
  root to: 'pages#home'

  devise_for :users do
    get '/users/sign_out' => 'devise/sessions#destroy'
  end
  resources :users
  resources :pages
  resources :administrator_dashboard, only: [:index]

  resources :feeds do
    member do
      resources :episodes, only: [:index, :show]
    end
  end
  resources :shows
  resources :shows, module: "shows" do
    resources :episodes
  end
end
