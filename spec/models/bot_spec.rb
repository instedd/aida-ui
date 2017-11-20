require 'rails_helper'

RSpec.describe Bot, type: :model do
  it "can create bot" do
    Bot.create!
  end
end
