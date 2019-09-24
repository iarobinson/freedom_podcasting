Rails.application.routes.draw do

  post "messages", to: "messages#create"
  root to: 'pages#home'

  resources :feeds
  resources :feeds do
    member do
      resources :episodes, only: [:index, :show]
    end
  end
  resources :episodes, only: [:index]

  resources :users
  devise_for :users do
    get '/users/sign_out' => 'devise/sessions#destroy'
  end

  resources :shows
  resources :shows, module: "shows" do
    resources :episodes
  end
end
