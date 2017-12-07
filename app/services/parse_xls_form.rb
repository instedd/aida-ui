require 'roo'

class ParseXlsForm
  def self.run(file)
    wb = Roo::Spreadsheet.open(file)
    survey_sheet = wb.sheet('survey')
    choices_sheet = wb.sheet('choices')

    questions = gather_questions(survey_sheet)
    choice_lists = gather_choices(choices_sheet)

    return { questions: questions, choice_lists: choice_lists }

  rescue ArgumentError
    fail "Invalid file type"
  rescue RangeError
    fail "File is not a XLS Form"
  end

  def self.gather_questions(sheet)
    return [
    ]
  end

  def self.gather_choices(sheet)
    return [
    ]
  end
end
