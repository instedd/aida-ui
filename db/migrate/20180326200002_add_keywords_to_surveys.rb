class AddKeywordsToSurveys < ActiveRecord::Migration[5.1]
  class Behaviour < ApplicationRecord
  end

  def up
    Behaviour.where(kind: "survey").each do |b|
      unless b.config.has_key?('keywords')
        new_config = b.config.dup
        new_config['keywords'] = ''
        b.update_attribute :config, new_config
      end
    end
  end

  def down
    Behaviour.where(kind: "survey").each do |b|
      if b.config.has_key?('keywords')
        new_config = b.config.dup
        new_config.delete('keywords')
        b.update_attribute :config, new_config
      end
    end
  end
end
