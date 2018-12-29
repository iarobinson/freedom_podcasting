Rails.application.routes.draw do

  resources :tags
  resources :posts
  resources :pages
  resources :profiles

  devise_for :users, :controllers => { :registrations => "registrations" }

  devise_scope :user do
    get 'login', to: 'devise/sessions#new'
    get 'signup', to: 'devise/registrations#new'
  end

  resources :users, module: "users" do
    resources :profile
  end

  root 'pages#home'

end
