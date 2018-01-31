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

    %w(decimal.xlsx cascading_select.xlsx cascading_select_integer.xlsx encrypt.xlsx image.xlsx integer.xlsx multiple_choice_lists.xlsx
    numbers.xlsx select_many.xlsx select_one.xlsx simple.xlsx single_choices_list_underscore.xlsx
    single_choices_list.xlsx no_choices.xlsx relevant_questions.xlsx constraint_basic.xlsx text.xlsx).each do |file|
      it "returns valid survey for #{file}" do
        result = ParseXlsForm.run(file_fixture(file).open)

        # since the result of the parser is used directly as survey skill config
        # let's better check here that all the expected parsed xlsforms validate with the config
        schema_file = Rails.root.join("app", "schemas", "types.json").read
        expect(JSON::Validator.validate(schema_file, result, fragment: "#/definitions/surveyConfig")).to eq(true)
      end
    end

    it "accepts forms exported from Kobo toolbox" do
      result = ParseXlsForm.run(file_fixture("kobo_sample.xls").open)

      expect(result[:questions].size).to eq(3)
      expect(result[:choice_lists].size).to eq(1)
    end

    it "accepts numbers in name and labels columns" do
      result = ParseXlsForm.run(file_fixture("numbers.xlsx").open)

      expect(result[:questions]).to match_array([{
                                                   type: "select_one",
                                                   name: "1",
                                                   choices: "1",
                                                   message: "1"
                                                 },
                                                 {
                                                   type: "integer",
                                                   name: "2",
                                                   message: "2"
                                                 }])
      expect(result[:choice_lists]).to match_array([{
                                                      name: "1",
                                                      choices: [
                                                        { name: "1", labels: "1" },
                                                        { name: "2", labels: "2" }
                                                      ]
                                                    }])
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

    it "parses image input question" do
      survey = Roo::Spreadsheet.open(file_fixture('image.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'image',
                                       name: 'ceiling',
                                       message: 'Send a picture of your ceiling'
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

    it "doesn't add relevant if the column doesn't exist" do
      survey = Roo::Spreadsheet.open(file_fixture('relevant_no_column.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                    type: 'select_one',
                                    name: 'likes_pizza',
                                    choices: 'yes_no',
                                    message: 'Do you like pizza?'
                                  },
                                  {
                                    type: 'select_many',
                                    name: 'favorite_topping',
                                    choices: 'pizza_toppings',
                                    message: 'Favorite toppings'
                                  }])
    end

    it "add relevant (only) to questions which relevant cell is not empty" do
      survey = Roo::Spreadsheet.open(file_fixture('relevant_questions.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                    type: 'select_one',
                                    name: 'likes_pizza',
                                    choices: 'yes_no',
                                    message: 'Do you like pizza?'
                                  },
                                  {
                                    type: 'select_many',
                                    name: 'favorite_topping',
                                    choices: 'pizza_toppings',
                                    message: 'Favorite toppings',
                                    relevant: "${likes_pizza} = 'yes'"
                                  },
                                  {
                                    type: 'text',
                                    name: 'why_not',
                                    message: 'Why not?!',
                                    relevant: "${likes_pizza} = 'no'"
                                  }])
    end

    it "parses constraint and constraint_message columns" do
      survey = Roo::Spreadsheet.open(file_fixture('constraint_basic.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'integer',
                                       name: 'age',
                                       message: 'How old are you?',
                                       constraint: '. <= 150',
                                       constraint_message: 'No way!'
                                     },
                                     {
                                       type: 'decimal',
                                       name: 'temperature',
                                       message: 'What is the current temperature?',
                                       constraint: '. >= -20 and . <= 50',
                                       constraint_message: 'No way!'
                                     },
                                     {
                                       type: 'text',
                                       name: 'foo',
                                       message: 'Say \'foo\'',
                                       constraint: '. = \'foo\'',
                                       constraint_message: 'Wrong!'
                                     },
                                     {
                                       type: 'select_one',
                                       name: 'ok',
                                       choices: 'yes_no',
                                       message: 'Are you ok?',
                                       constraint_message: 'Answer yes or no'
                                     }
                                    ])
    end

    it "rejects constraints given for select_one and select_multiple questions" do
      survey = Roo::Spreadsheet.open(file_fixture('constraint_select.xlsx').open).sheet('survey')

      expect do
        ParseXlsForm.gather_questions(survey)
      end.to raise_error(/constraint must be blank for/)
    end

    it "does not add constraint_message if constraint is missing in non-select questions" do
      survey = Roo::Spreadsheet.open(file_fixture('constraint_message_without_constraint.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'integer',
                                       name: 'age',
                                       message: 'How old are you?'
                                     }])
    end

    it "parses choice_filter if present" do
      survey = Roo::Spreadsheet.open(file_fixture('cascading_select.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'select_one',
                                       choices: 'states',
                                       name: 'state',
                                       message: 'state'
                                     },
                                     {
                                       type: 'select_one',
                                       choices: 'counties',
                                       name: 'county',
                                       message: 'county',
                                       choice_filter: 'state=${state}'
                                     },
                                     {
                                       type: 'select_one',
                                       choices: 'cities',
                                       name: 'city',
                                       message: 'city',
                                       choice_filter: 'state=${state} and county=${county}'
                                     }])
    end

    it "parses encrypt if present" do
      survey = Roo::Spreadsheet.open(file_fixture('encrypt.xlsx').open).sheet('survey')
      result = ParseXlsForm.gather_questions(survey)

      expect(result).to match_array([{
                                       type: 'select_one',
                                       choices: 'male_female',
                                       name: 'gender',
                                       message: 'Respondent gender?',
                                       encrypt: true,
                                     },
                                     {
                                       type: 'integer',
                                       name: 'age',
                                       message: 'Respondent age?',
                                       encrypt: true,
                                     },
                                     {
                                       type: 'integer',
                                       name: 'secret',
                                       message: 'secret',
                                       encrypt: true,
                                     },
                                     {
                                       type: 'integer',
                                       name: 'num1',
                                       message: 'Num1'
                                     },
                                     {
                                       type: 'integer',
                                       name: 'num2',
                                       message: 'Num2'
                                     },
                                     {
                                       type: 'integer',
                                       name: 'num3',
                                       message: 'Num3'
                                     },
                                     {
                                       type: 'integer',
                                       name: 'num4',
                                       message: 'Num4'
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

    it "parses choices with extra attributes if present" do
      choices = Roo::Spreadsheet.open(file_fixture('cascading_select.xlsx').open).sheet('choices')
      result = ParseXlsForm.gather_choices(choices)

      expect(result).to match_array([{
                                       name: 'states',
                                       choices: [
                                         { name: 'texas', labels: 'Texas' },
                                         { name: 'washington', labels: 'Washington' },
                                       ]
                                     },
                                     {
                                       name: 'counties',
                                       choices: [
                                         { name: 'king', labels: 'King', attributes: { state: 'washington' } },
                                         { name: 'pierce', labels: 'Pierce', attributes: { state: 'washington' } },
                                         { name: 'king', labels: 'King', attributes: { state: 'texas' } },
                                         { name: 'cameron', labels: 'Cameron', attributes: { state: 'texas' } },
                                       ]
                                     },
                                     {
                                       name: 'cities',
                                       choices: [
                                         { name: 'dumont', labels: 'Dumont', attributes: { state: 'texas', county: 'king' } },
                                         { name: 'finney', labels: 'Finney', attributes: { state: 'texas', county: 'king' } },
                                         { name: 'brownsville', labels: 'Brownsville', attributes: { state: 'texas', county: 'cameron' } },
                                         { name: 'harlingen', labels: 'Harlingen', attributes: { state: 'texas', county: 'cameron' } },
                                         { name: 'seattle', labels: 'Seattle', attributes: { state: 'washington', county: 'king' } },
                                         { name: 'redmond', labels: 'Redmond', attributes: { state: 'washington', county: 'king' } },
                                         { name: 'tacoma', labels: 'Tacoma', attributes: { state: 'washington', county: 'pierce' } },
                                         { name: 'puyallup', labels: 'Puyallup', attributes: { state: 'washington', county: 'pierce' } },
                                       ]
                                     }])
    end

    it "parses choices with extra integer attributes" do
      choices = Roo::Spreadsheet.open(file_fixture('cascading_select_integer.xlsx').open).sheet('choices')
      result = ParseXlsForm.gather_choices(choices)

      expect(result).to match_array([{
                                       name: 'flavour',
                                       choices: [
                                         { name: 'strawberry', labels: 'strawberry', attributes: { min_age: 0, max_age: 40} },
                                         { name: 'blue_moon', labels: 'blue moon', attributes: { min_age: 0, max_age: 12} },
                                         { name: 'tutti_frutti', labels: 'tutti frutti', attributes: { min_age: 0, max_age: 12} },
                                         { name: 'mint_chocolate_chip', labels: 'mint chocolate chip', attributes: { min_age: 10, max_age: 999} },
                                         { name: 'coffee', labels: 'coffee', attributes: { min_age: 30, max_age: 999} },
                                         { name: 'green_tea', labels: 'green tea', attributes: { min_age: 40, max_age: 999} },
                                       ]
                                     }])
    end

    it "validates uniqueness of choice in lists" do
      choices = Roo::Spreadsheet.open(file_fixture('duplicate_names.xlsx').open).sheet('choices')

      expect do
        ParseXlsForm.gather_choices(choices)
      end.to raise_error(/duplicate choice name.*'male_female'/)
    end

    it "validates uniqueness of choice with attributes in lists" do
      choices = Roo::Spreadsheet.open(file_fixture('cascading_select_duplicate_choice_names.xlsx').open).sheet('choices')

      expect do
        ParseXlsForm.gather_choices(choices)
      end.to raise_error(/duplicate choice name.*'brownsville'/)
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
