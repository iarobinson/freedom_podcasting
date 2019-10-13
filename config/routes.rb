Rails.application.routes.draw do

  post "messages", to: "messages#create"
  root to: 'pages#home'

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
