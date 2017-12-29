require 'rails_helper'

RSpec.describe VariableAssignment, type: :model do
  let!(:bot) { Bot.create_prepared!(User.create email: 'foo@example.com')}

  def variable_attributes
    { variable_id: SecureRandom.uuid, condition_id: SecureRandom.uuid, condition_order: 0 }
  end

  def create!(attributes)
    bot.variable_assignments.create! variable_attributes.merge(attributes)
  end

  it "allows empty variable_name" do
    create!(variable_name: nil)
    create!(variable_name: "")
  end

  it "allows empty lang" do
    create!(lang: nil)
    create!(lang: "")
  end

  it "can create variable without condition" do
    create!(variable_name: "foo", condition: nil)
    create!(variable_name: "foo", condition: "")
  end

  it "can create variable with condition" do
    create!(variable_name: "foo", condition: "${age} > 18", condition_order: 1)
  end

  it "can create multiple conditions and translations" do
    default = create!(condition_order: 0)
    create!(variable_id: default.variable_id, condition_id: default.condition_id, lang: "es", condition_order: 0)

    cond1 = create!(variable_id: default.variable_id, condition: "${ans} = 42", condition_order: 1)
    cond1_es = create!(variable_id: default.variable_id, condition_id: cond1.condition_id, condition: "${ans} = 42", lang: "es", condition_order: 1)

    cond2 = create!(variable_id: default.variable_id, condition: "${ans} = 38", condition_order: 2)
    cond2_es = create!(variable_id: default.variable_id, condition_id: cond2.condition_id, condition: "${ans} = 38", lang: "es", condition_order: 2)
  end

  it "order should be 0 if condition is empty" do
    create!(condition_order: 0)
    create!(condition_order: 0, condition: "")
    create!(condition_order: 1, condition: "${ans} = 42")


    expect { create!(condition_order: 0, condition: "${ans} = 42") }.to raise_exception(ActiveRecord::RecordInvalid)
    expect { create!(condition_order: 1) }.to raise_exception(ActiveRecord::RecordInvalid)
    expect { create!(condition_order: 1, condition: "") }.to raise_exception(ActiveRecord::RecordInvalid)
  end
end
