require 'rails_helper'

RSpec.describe DataTable, type: :model do
  describe "validations" do
    describe "data" do
      it "cannot be nil" do
        expect(build(:data_table, data: nil)).not_to be_valid
      end

      it "can have no data rows" do
        expect(build(:data_table, data: [%w(key value)])).to be_valid
      end

      it "can be a 2x2 grid" do
        expect(build(:data_table, data: [%w(key value), %w(foo bar)])).to be_valid
      end

      it "must have a header row" do
        expect(build(:data_table, data: [])).not_to be_valid
      end

      it "must be an array of arrays" do
        expect(build(:data_table, data: ['key'])).not_to be_valid
        expect(build(:data_table, data: [%w(key value), 'foo'])).not_to be_valid
      end

      it "must have at least two columns" do
        expect(build(:data_table, data: [%w(key)])).not_to be_valid
      end

      it "must have all rows the same size" do
        expect(build(:data_table, data: [%w(key value), []])).not_to be_valid
        expect(build(:data_table, data: [%w(key value), %w(foo)])).not_to be_valid
      end
    end
  end
end
