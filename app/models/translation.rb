class Translation < ApplicationRecord
  belongs_to :behaviour

  validates_presence_of :key
  validates_presence_of :lang

  def bot
    behaviour.bot
  end
end
