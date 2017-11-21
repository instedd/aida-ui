class WelcomeController < ApplicationController
  before_action :authenticate_user!, only: [:login]

  def index
    if user_signed_in?
      render :index
    else
      render :landing
    end
  end

  def login
    redirect_to root_path
  end

  def logout
    sign_out :user
    redirect_to root_path
  end

  def design
  end
end
