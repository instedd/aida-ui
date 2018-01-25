FactoryBot.define do
  factory :user, aliases: [:owner] do
    sequence(:email) { |n| "user-#{n}@example.com" }
  end

  factory :bot do
    owner

    transient {
      shared_with nil
      grants ['results']
    }

    initialize_with {
      Bot.create_prepared!(owner).tap do |bot|
        bot.collaborators.add_collaborator!(shared_with, roles: grants) if shared_with.present?
      end
    }

    trait :published do
      sequence(:uuid) { |n| "bot-uuid-#{n}" }
    end
  end

  factory :collaborator do
    bot
    user
    roles ['results']
  end

  factory :invitation do
    bot
    creator { bot.owner }
    email { generate(:email) }
    roles ['results']

    trait :anonymous do
      email nil
    end
  end

  sequence :email do |n|
    "sample-#{n}@example.com"
  end

  factory :data_table do
    bot
    sequence(:name) { |n| "data-table-#{n}" }
  end
end
