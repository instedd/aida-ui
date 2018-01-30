class DataTable < ApplicationRecord
  belongs_to :bot

  validates_presence_of :name
  validates_presence_of :data
  validates_uniqueness_of :name, scope: :bot_id
  validate :shape_of_data

  def columns
    data.first
  end

  def manifest_fragment
    {
      name: name,
      columns: columns,
      data: data.drop(1)
    }
  end

  private

  def shape_of_data
    unless data.nil?
      shape_valid = data.is_a?(Array) && data.first.is_a?(Array)
      if shape_valid
        column_count = data.first.size
        shape_valid = column_count >= 2 && data.all? do |row|
          row.is_a?(Array) && row.size == column_count
        end
      end

      unless shape_valid
        errors[:data] << "must be a grid as an array of arrays and have at least 2 columns"
      end
    end
  end
end
