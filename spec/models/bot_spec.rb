require 'rails_helper'

RSpec.describe Bot, type: :model do
  it "can create bot" do
    Bot.create! owner: User.create!(email: "user@example.org")
  end
end
