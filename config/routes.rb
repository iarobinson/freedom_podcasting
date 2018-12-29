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

  resources :posts do
    collection do
      get 'hobby'
      get 'study'
      get 'team'
    end
  end

  root 'pages#home'

end
