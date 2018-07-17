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
        post :set_session
        get :stats
        get :data
        get :error_logs
        get :manifest
      end
      resource :front_desk, only: [:show, :update]
      resources :skills, only: [:index, :create] do
        collection do
          post :reorder
        end
      end
      resources :translations, only: [:index] do
        collection do
          put :update

          put :variable, to: 'translations#update_variable'
          delete :variable, to: 'translations#destroy_variable'
        end
      end
      resources :sessions, only: [:index] do
        member do
          get :log
          post :send_message
        end
      end

      resources :data_tables, only: [:index, :create]
    end

    resources :channels, only: [:update]
    resources :skills, only: [:update, :destroy]
    resources :data_tables, only: [:show, :update, :destroy] do
      collection do
        post :parse
      end
    end

    resources :collaborators, only: [:update, :destroy]
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

    get :encryption_keys, to: 'encryption_keys#fetch'
    post :encryption_keys, to: 'encryption_keys#update'
  end

  get "/_design(/*path)", to: 'welcome#design'
  get "/login", to: 'welcome#login'
  get "/logout", to: 'welcome#logout'

  # generate_token is in other controller to restrict interactive users only
  put "/api/v1/generate_token", to: 'welcome#generate_token'

  root to: 'welcome#index'
  get "/b(/*path)", to: 'welcome#index'
  get "/b/:bot_id/behaviour", to: 'welcome#index', as: 'bot_behaviour'
  get "/settings(/*path)", to: 'welcome#index'
  get "/invitation/:token", to: 'welcome#index', as: 'invitation'

  post '/notifications/:notifications_secret', to: 'api/notifications#create', as: 'notifications_create'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
