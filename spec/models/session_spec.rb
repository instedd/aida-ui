require 'rails_helper'

RSpec.describe Session, type: :model do
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: user) }

  describe "create" do
    it "creates a session for his owner" do
      expect do
        session = create(:session, user: user, bot: bot, session_uuid: 'session uuid abc')
      end.to change(Session, :count).by(1)
      expect(bot.get_session(user)).to_not be_nil
      expect(bot.get_session(user).session_uuid).to eq("session uuid abc")
    end

    it "creates a session for a collaborator" do
      collaborator = create(:user)
      create(:collaborator, bot: bot, user:collaborator)
      expect do
        session = create(:session, user: collaborator, bot: bot, session_uuid: "session uuid bcd")
      end.to change(Session, :count).by(1)
      expect(bot.get_session(collaborator)).to_not be_nil
      expect(bot.get_session(collaborator).session_uuid).to eq("session uuid bcd")
    end

    it "does not create a session for unauthorized" do
      owner = create(:user)
      bot = create(:bot, owner: owner)
      unauthorized = create(:user)
      expect do
        session = create(:session, user: unauthorized, bot: bot, session_uuid: 'session uuid abc')
      end.to raise_error(ActiveRecord::RecordInvalid,"Validation failed: User is not a collaborator")
      expect(bot.get_session(unauthorized)).to be_nil
    end

    it "does not create a session whitout an user" do
      expect do
        session = create(:session, bot: bot, user:nil)
      end.to raise_error(ActiveRecord::RecordInvalid,"Validation failed: User must exist, User can't be blank")
    end

    it "does not create a session whitout a bot" do
      expect do
        session = create(:session, bot: nil, user:user)
      end.to raise_error(ActiveRecord::RecordInvalid,"Validation failed: Bot must exist, Bot can't be blank")
    end

  end
end
