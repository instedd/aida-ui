FactoryBot.define do
  factory :user, aliases: [:owner] do
    sequence(:email) { |n| "user-#{n}@example.com" }
  end

  factory :bot do
    owner
    initialize_with { Bot.create_prepared!(owner) }

    trait :published do
      sequence(:uuid) { |n| "bot-uuid-#{n}" }
    end
  end
end
