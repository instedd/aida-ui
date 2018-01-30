class Api::EncryptionKeysController < ApplicationApiController

  def fetch
  end

  def update
    current_user.update_attributes!({
      public_key: params[:public_key],
      encrypted_secret_key: params[:encrypted_secret_key]
    })
  end
end