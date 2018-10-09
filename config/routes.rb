Rails.application.routes.draw do

  devise_for :producers, controllers: { sessions: "producers/sessions" }
  devise_for :clients, controllers: { sessions: "clients/sessions" }
  resources :pages, :producers, :clients, :home

  root 'pages#home'
end
