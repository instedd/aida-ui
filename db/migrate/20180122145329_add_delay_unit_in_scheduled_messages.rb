class AddDelayUnitInScheduledMessages < ActiveRecord::Migration[5.1]
  class Behaviour < ApplicationRecord
  end

  def up
    Behaviour.where(kind: "scheduled_messages").each do |b|
      if b.config['schedule_type'] == 'since_last_incoming_message'
        new_config = b.config.dup
        new_config['messages'] = new_config['messages'].map do |m|
          delay_and_unit = case m['delay']
                           when 60
                             [1, 'hour']
                           when 1440
                             [1, 'day']
                           when 10080
                             [1, 'week']
                           when 40320
                             [1, 'month']
                           else
                             [m['delay'], 'minute']
                           end
          {
            'id' => m['id'],
            'delay' => delay_and_unit.first,
            'delay_unit' => delay_and_unit.second,
            'message' => m['message']
          }
        end
        b.update_attribute :config, new_config
      end
    end
  end

  def down
    Behaviour.where(kind: "scheduled_messages").each do |b|
      if b.config['schedule_type'] == 'since_last_incoming_message'
        new_config = b.config.dup
        new_config['messages'] = new_config['messages'].map do |m|
          # NB: loosy conversion
          delay = case m['delay_unit']
                  when 'month'
                    40320
                  when 'week'
                    10080
                  when 'day'
                    1440
                  else
                    60
                  end
          {
            'id' => m['id'],
            'delay' => delay,
            'message' => m['message']
          }
        end
        b.update_attribute :config, new_config
      end
    end
  end
end
