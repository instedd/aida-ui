require 'rails_helper'

RSpec.describe ParseXlsForm, type: :service do
  describe "file validation" do
    it "rejects invalid file types" do
      expect do
        ParseXlsForm.run(file_fixture('invalid_file_type.txt').to_path)
      end.to raise_error(RuntimeError)
    end

    it "rejects spreadsheets which are not XLS forms" do
      expect do
        ParseXlsForm.run(file_fixture('empty_workbook.xlsx').open)
      end.to raise_error(RuntimeError)
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
  end
end
