require 'rails_helper'

RSpec.describe ParseXlsForm, type: :service do
  describe "file validation" do
    it "rejects invalid file types" do
      expect do
        ParseXlsForm.run(file_fixture('invalid_file_type.txt').to_path)
      end.to raise_error(/invalid file type/)
    end

    it "rejects spreadsheets which are not XLS forms" do
      expect do
        ParseXlsForm.run(file_fixture('empty_workbook.xlsx').open)
      end.to raise_error(/file is not/)
    end

    it "returns parsed questions for simple input" do
      result = ParseXlsForm.run(file_fixture('simple.xlsx').open)

      expect(result).to match({ questions: [
                                  {
                                    type: 'select_one',
                                    name: 'gender',
                                    choices: 'male_female',
                                    message: 'Respondent gender?'
                                  },
                                  {
                                    type: 'integer',
                                    name: 'age',
                                    message: 'Respondent age?'
                                  }
                                ],
                                choice_lists: [
                                  {
                                    name: 'male_female',
                                    choices: [
                                      { name: 'male', labels: 'Male' },
                                      { name: 'female', labels: 'Female' }
                                    ]
                                  }
                                ]
                              })
    end
  end

  describe "gather questions" do
    it "parses select_one question" do
      survey = Roo::Spreadsheet.open(file_fixture('select_one.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'select_one',
                                       name: 'fruit',
                                       choices: 'fruits',
                                       message: 'Your favourite fruit?'
                                     }])
    end

    it "parses select_many question" do
      survey = Roo::Spreadsheet.open(file_fixture('select_many.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'select_many',
                                       name: 'fruits',
                                       choices: 'fruits',
                                       message: 'What fruits do you like in your fruit salad?'
                                     }])
    end

    it "parses integer input question" do
      survey = Roo::Spreadsheet.open(file_fixture('integer.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'integer',
                                       name: 'age',
                                       message: 'How old are you?'
                                     }])
    end

    it "parses decimal input question" do
      survey = Roo::Spreadsheet.open(file_fixture('decimal.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'decimal',
                                       name: 'wine_temp',
                                       message: 'At what temperature do you like your red wine?'
                                     }])
    end

    it "parses text input question" do
      survey = Roo::Spreadsheet.open(file_fixture('text.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'text',
                                       name: 'request',
                                       message: 'Any particular requests for your dinner?'
                                     }])
    end

    it "validates uniqueness of question names" do
      survey = Roo::Spreadsheet.open(file_fixture('duplicate_names.xlsx').open).sheet('survey')

      expect do
        ParseXlsForm.gather_questions(survey)
      end.to raise_error(/duplicate question.*'age'/)
    end

    it "validates question names are well-formed" do
      survey = Roo::Spreadsheet.open(file_fixture('invalid_question_name.xlsx').open).sheet('survey')

      expect do
        ParseXlsForm.gather_questions(survey)
      end.to raise_error(/invalid question name/)
    end
  end

  describe "gather choices" do
    it "parses single choice list" do
      choices = Roo::Spreadsheet.open(file_fixture('single_choices_list.xlsx').open).sheet('choices')
      result = ParseXlsForm.gather_choices(choices)

      expect(result).to match_array([{
                                       name: 'yes_no',
                                       choices: [
                                         { name: 'yes', labels: 'yes,ok' },
                                         { name: 'no', labels: 'no,never' },
                                       ]
                                     }])
    end

    it "parses single choice list list_name column" do
      choices = Roo::Spreadsheet.open(file_fixture('single_choices_list_underscore.xlsx').open).sheet('choices')
      result = ParseXlsForm.gather_choices(choices)

      expect(result).to match_array([{
                                       name: 'yes_no',
                                       choices: [
                                         { name: 'yes', labels: 'yes,ok' },
                                         { name: 'no', labels: 'no,never' },
                                       ]
                                     }])
    end

    it "parses multiple choice lists" do
      choices = Roo::Spreadsheet.open(file_fixture('multiple_choice_lists.xlsx').open).sheet('choices')
      result = ParseXlsForm.gather_choices(choices)

      expect(result).to match_array([{
                                       name: 'yes_no',
                                       choices: [
                                         { name: 'yes', labels: 'yes,ok' },
                                         { name: 'no', labels: 'no,never' },
                                       ]
                                     },
                                     {
                                       name: 'wine_grapes',
                                       choices: [
                                         { name: 'malbec', labels: 'malbec' },
                                         { name: 'syrah', labels: 'syrah' },
                                         { name: 'merlot', labels: 'merlot' }
                                       ]
                                     }])
    end

    it "validates uniqueness of choice in lists" do
      choices = Roo::Spreadsheet.open(file_fixture('duplicate_names.xlsx').open).sheet('choices')

      expect do
        ParseXlsForm.gather_choices(choices)
      end.to raise_error(/duplicate choice name.*'male_female'/)
    end

    it "validates list names are well-formed" do
      choices = Roo::Spreadsheet.open(file_fixture('invalid_list_name.xlsx').open).sheet('choices')

      expect do
        ParseXlsForm.gather_choices(choices)
      end.to raise_error(/invalid list name/)
    end

    it "validates choice names are well-formed" do
      choices = Roo::Spreadsheet.open(file_fixture('invalid_choice_name.xlsx').open).sheet('choices')

      expect do
        ParseXlsForm.gather_choices(choices)
      end.to raise_error(/invalid choice name/)
    end
  end

  describe "general validations" do
    it "validates referenced choice lists exist" do
      expect do
        ParseXlsForm.run(file_fixture('inexistent_choice_list.xlsx').to_path)
      end.to raise_error(/choice list.*is not defined/)
    end
  end

  describe "name_valid?" do
    ['foo', 'foo_bar', 'foo-bar', 'Foo', 'name1', 'name_1', '1QUESTION', '32'].each do |name|
      it "#{name} is accepted" do
        expect(ParseXlsForm.name_valid?(name)).to be_truthy
      end
    end

    [nil, '', ' ', 'foo/bar', 'question?', 'aha!'].each do |name|
      it "#{name} is rejected" do
        expect(ParseXlsForm.name_valid?(name)).to be_falsey
      end
    end
  end
end
