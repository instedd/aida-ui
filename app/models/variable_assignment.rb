class VariableAssignment < ApplicationRecord
  belongs_to :bot

  validate :non_zero_condition_order

  default_scope { order(:variable_name, :condition_order) }

  def self.api_json(variable_assignments, default_language, other_languages)
    variable_assignments.group_by(&:variable_id).map do |_, assignments|
      default_value_assignments = assignments.select { |a| a.condition_id.blank? }
      conditional_values_assignments = assignments.select { |a| a.condition_id.present? }.group_by(&:condition_id)

      {
        id: assignments.first.variable_id,
        name: assignments.first.variable_name,
        default_value: build_translated_values(default_value_assignments, default_language, other_languages),
        conditional_values: conditional_values_assignments.map do |_, condition_assignments|
          {
            id: condition_assignments.first.condition_id,
            condition: condition_assignments.first.condition,
            order: condition_assignments.first.condition_order,
            value: build_translated_values(condition_assignments, default_language, other_languages),
          }
        end
      }
    end
  end

  def self.manifest(variable_assignments, default_language, other_languages)
    variable_assignments.group_by(&:variable_id).map do |_, assignments|
      default_value_assignments = assignments.select { |a| a.condition_id.blank? }
      conditional_values_assignments = assignments.select { |a| a.condition_id.present? }.group_by(&:condition_id)

      {
        name: assignments.first.variable_name,
        values: build_translated_values(default_value_assignments, default_language, other_languages),
        overrides: conditional_values_assignments.map do |_, condition_assignments|
          {
            relevant: condition_assignments.first.condition,
            values: build_translated_values(condition_assignments, default_language, other_languages),
          }
        end
      }
    end
  end

  private

  def self.build_translated_values(condition_assignments, default_language, other_languages)
    res = {}
    res[default_language.to_sym] = condition_assignments.find { |a| a.lang.blank? }.value
    other_languages.inject(res) do |memo, lang|
      memo[lang.to_sym] = condition_assignments.find { |a| a.lang == lang }.value rescue ''
      memo
    end

    res
  end

  def non_zero_condition_order
    if condition.nil?
      errors.add(:condition_order, "condition_order must be zero if no condition") unless condition_order == 0
    else
      errors.add(:condition_order, "condition_order greater than zero if condition") unless condition_order > 0
    end
  end
end
