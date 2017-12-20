FactoryBot.define do
  factory :user, aliases: [:owner] do
    sequence(:email) { |n| "user-#{n}@example.com" }
  end

  factory :bot do
    owner

    transient {
      shared_with nil
    }

    initialize_with {
      Bot.create_prepared!(owner).tap do |bot|
        bot.collaborators.add_collaborator!(shared_with) if shared_with.present?
      end
    }

    trait :published do
      sequence(:uuid) { |n| "bot-uuid-#{n}" }
    end
  end

  factory :collaborator do
    bot
    user
    role "collaborator"
  end

  factory :invitation do
    bot
    email { generate(:email) }
    role "collaborator"

    trait :anonymous do
      email nil
    end
  end

  sequence :email do |n|
    "sample-#{n}@example.com"
  end
end
