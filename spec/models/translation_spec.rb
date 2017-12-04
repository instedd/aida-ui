require 'rails_helper'

RSpec.describe Translation, type: :model do
  let!(:bot) { Bot.create_prepared!(User.create email: 'foo@example.com')}
end
