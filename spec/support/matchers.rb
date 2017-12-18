require "rspec/expectations"

module AidaMatchers
  extend RSpec::Matchers::DSL

  %w(bot channel skill bot_stats translations_index).each do |noun|
    matcher "be_a_#{noun}_as_json".to_sym do
      define_method :fragment do
        "#/definitions/#{noun}"
      end

      match do |actual|
        validates_schema?(actual, fragment) and attributes_match?(actual, @expected)
      end

      failure_message do |actual|
        unless validates_schema?(actual, fragment)
          "expected that #{actual} would validate schema fragment #{fragment}"
        else
          "expected that #{actual} would match #{@expected}"
        end
      end

      chain :matching do |attributes|
        @expected = attributes
      end
    end
  end

  matcher :match_attributes do |expected|
    match do |actual|
      attributes_match?(actual, expected)
    end
  end

  def schema_file
    @@schema ||= Rails.root.join("app", "schemas", "types.json").read
  end

  def validates_schema?(value, fragment)
    JSON::Validator.validate(schema_file, value, fragment: fragment)
  end

  def attributes_match?(value, expected)
    expected.nil? or expected.inject(true) do |result, expected_key_value|
      result && match(expected_key_value.second).matches?(value[expected_key_value.first.to_s])
    end
  end

  def json_pluck(array, key)
    array.map { |elt| elt[key] }
  end
end

RSpec.configure do |config|
  config.include AidaMatchers
end
