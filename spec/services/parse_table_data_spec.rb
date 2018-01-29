require 'rails_helper'

RSpec.describe ParseTableData, type: :service do
  describe "file validation" do
    it "rejects invalid file types" do
      expect do
        ParseTableData.run(file_fixture('invalid_file_type.txt').to_path)
      end.to raise_error(/file type not supported/)
    end

    it "accepts CSV files" do
      data = ParseTableData.run(file_fixture('simple_table.csv').to_path)
      expect(data).to match_array([['key', 'label'],
                                   ['foo', 'bar'],
                                   ['baz', 'quux'],
                                   ['lala', '123']])
    end

    it "accepts Excel files and parses the first sheet" do
      data = ParseTableData.run(file_fixture('simple_table.xlsx').to_path)
      expect(data).to match_array([['key', 'label'],
                                   ['foo', 'bar'],
                                   ['baz', 'quux'],
                                   ['lala', 123]])
    end

    it "rejects empty files" do
      expect do
        ParseTableData.run(file_fixture('empty_file.csv').to_path)
      end.to raise_error(/table must have/)
    end
  end

  describe "column validation" do
    it "rejects files with less than 2 columns" do
      expect do
        ParseTableData.run(file_fixture('single_column.csv').to_path)
      end.to raise_error(/table must have/)
    end

    it "normalizes column names" do
      data = ParseTableData.run(file_fixture('column_normalization.csv').to_path)
      expect(data.first).to match_array(['first', 'second', 'third column', 'fourth  column', '5'])
    end

    it "checks that there are no duplicate column names" do
      expect do
        ParseTableData.run(file_fixture('duplicate_columns.csv').to_path)
      end.to raise_error(/duplicate column/)
    end
  end
end
