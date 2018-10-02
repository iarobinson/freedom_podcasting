Rails.application.routes.draw do

  devise_scope :clients do
    get "/sign_in" => "devise/sessions#new"
    get "/sign_up" => "devise/regestrations#new", as: "new_user_registration"
  end

  devise_for :producers, controllers: { sessions: "users/sessions" }
  devise_for :clients, controllers: { sessions: "users/sessions" }
  resources :pages
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root to: "home#index"
  # get 'signup' => 'users#new'
end
