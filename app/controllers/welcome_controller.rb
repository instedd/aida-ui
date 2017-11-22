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
    respond_to do |format|
      format.all { head :no_content }
      format.html { redirect_to after_sign_out_path_for(:user) }
    end
  end

  def design
  end
end
