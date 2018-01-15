require 'rails_helper'

RSpec.describe RolesMixin do
  class TestPolicy
    include RolesMixin
    attr_reader :user, :bot

    def initialize(user, bot)
      @user = user
      @bot = bot
    end
  end

  let!(:owner) { create(:user) }
  let!(:user) { create(:user) }
  let!(:bot) { create(:bot, owner: owner) }

  describe "owner" do
    let(:subject) { TestPolicy.new(owner, bot) }

    it { expect(subject.can_admin?).to be true }
    it { expect(subject.can_publish?).to be true }
    it { expect(subject.manages_behaviour?).to be true }
    it { expect(subject.manages_content?).to be true }
    it { expect(subject.manages_variables?).to be true }
    it { expect(subject.manages_results?).to be true }
  end

  describe "shared bot" do
    let(:subject) { TestPolicy.new(user, bot) }
    let!(:collaborator) { create(:collaborator, bot: bot, user: user, roles: roles) }

    describe "with publish role" do
      let(:roles) { %w(publish) }

      it { expect(subject.can_admin?).to be false }
      it { expect(subject.can_publish?).to be true }
      it { expect(subject.manages_behaviour?).to be true }
      it { expect(subject.manages_content?).to be true }
      it { expect(subject.manages_variables?).to be true }
      it { expect(subject.manages_results?).to be true }
    end

    describe "with behaviour role" do
      let(:roles) { %w(behaviour) }

      it { expect(subject.can_admin?).to be false }
      it { expect(subject.can_publish?).to be false }
      it { expect(subject.manages_behaviour?).to be true }
      it { expect(subject.manages_content?).to be true }
      it { expect(subject.manages_variables?).to be true }
      it { expect(subject.manages_results?).to be false }
    end

    describe "with content role" do
      let(:roles) { %w(content) }

      it { expect(subject.can_admin?).to be false }
      it { expect(subject.can_publish?).to be false }
      it { expect(subject.manages_behaviour?).to be false }
      it { expect(subject.manages_content?).to be true }
      it { expect(subject.manages_variables?).to be false }
      it { expect(subject.manages_results?).to be false }
    end

    describe "with variables role" do
      let(:roles) { %w(variables) }

      it { expect(subject.can_admin?).to be false }
      it { expect(subject.can_publish?).to be false }
      it { expect(subject.manages_behaviour?).to be false }
      it { expect(subject.manages_content?).to be false }
      it { expect(subject.manages_variables?).to be true }
      it { expect(subject.manages_results?).to be false }
    end

    describe "with results role" do
      let(:roles) { %w(results) }

      it { expect(subject.can_admin?).to be false }
      it { expect(subject.can_publish?).to be false }
      it { expect(subject.manages_behaviour?).to be false }
      it { expect(subject.manages_content?).to be false }
      it { expect(subject.manages_variables?).to be false }
      it { expect(subject.manages_results?).to be true }
    end
  end
end
