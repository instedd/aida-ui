class AddDefaultHourMatrixAndTimezoneToHumanOverride < ActiveRecord::Migration[5.1]
  class Behaviour < ApplicationRecord
  end
  def default_hour_matrix
    (1..7).map do
      (1..48).map do
        false
      end
    end
  end

  def up
    Behaviour.where(kind: "human_override").each do |b|
      new_config = b.config.dup
      new_config['hours'] = default_hour_matrix
      new_config['timezone'] = "Etc/UTC"
      b.update_attribute :config, new_config
    end
  end

  def down
    Behaviour.where(kind: "human_override").each do |b|
      old_config = b.config.dup
      old_config.delete('hours')
      old_config.delete('timezone')
      b.update_attribute :config, old_config
    end
  end
end
