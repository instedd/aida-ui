Rails.application.routes.draw do
  devise_for :users, controllers: {omniauth_callbacks: 'omniauth_callbacks'}
  guisso_for :user

  namespace :api, path: "/api/v1" do
    resources :bots, only: [:index, :create, :update, :destroy] do
      resources :channels, only: [:index]
      resources :collaborators, only: [:index]
      resources :invitations, only: [:create]
      member do
        post :publish
        delete :publish, action: :unpublish
        post :duplicate
        post :preview
        get :stats
        get :data
        get :manifest
      end
      resource :front_desk, only: [:show, :update]
      resources :skills, only: [:index, :create]
      resources :translations, only: [:index] do
        collection do
          put :update

          put :variable, to: 'translations#update_variable'
          delete :variable, to: 'translations#destroy_variable'
        end
      end
    end

    resources :channels, only: [:update]
    resources :skills, only: [:update, :destroy]
    resources :collaborators, only: [:destroy]
    resources :invitations, only: [:destroy] do
      member do
        post :resend
      end
      collection do
        get :retrieve
        post :accept
      end
    end

    post :xls_form, to: 'xls_form#upload'
  end

  get "/_design(/*path)", to: 'welcome#design'
  get "/login", to: 'welcome#login'
  get "/logout", to: 'welcome#logout'

  root to: 'welcome#index'
  get "/b(/*path)", to: 'welcome#index'
  get "/invitation/:token", to: 'welcome#index', as: 'invitation'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
