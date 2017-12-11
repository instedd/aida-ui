require 'roo'

class ParseXlsForm
  def self.run(file)
    wb = Roo::Spreadsheet.open(file)

    questions = gather_questions(wb.sheet('survey'))
    choice_lists = gather_choices(wb.sheet('choices'))

    return { questions: questions, choice_lists: choice_lists }

  rescue ArgumentError
    fail "Invalid file type"
  rescue RangeError
    fail "File is not a XLS Form"
  end

  def self.gather_questions(sheet)
    header = sheet.row(sheet.first_row)
    type_col = header.find_index 'type'
    name_col = header.find_index 'name'
    message_col = header.find_index 'message'

    fail "missing 'type' column in survey sheet" unless type_col.present?
    fail "missing 'name' column in survey sheet" unless name_col.present?
    fail "missing 'message' column in survey sheet" unless message_col.present?

    ((sheet.first_row + 1)..sheet.last_row).map do |row_number|
      row = sheet.row(row_number)
      if question_type = row[type_col].presence
        type, choices = question_type.split(/\s+/)
        name = row[name_col]
        message = row[message_col]

        case type
        when 'integer', 'decimal', 'text'
          {
            type: type,
            name: name,
            message: message
          }
        when 'select_one', 'select_many'
          {
            type: type,
            name: name,
            choices: choices,
            message: message
          }
        else
          fail "unsupported question type '#{type}' at row #{row_number}"
        end
      else
        # ignore empty row
        nil
      end
    end.compact
  end

  def self.gather_choices(sheet)
    header = sheet.row(sheet.first_row)
    list_name_col = header.find_index 'list name'
    name_col = header.find_index 'name'
    label_col = header.find_index 'label'

    fail "missing 'list name' column in choices sheet" unless list_name_col.present?
    fail "missing 'name' column in choices sheet" unless name_col.present?
    fail "missing 'label' column in choices sheet" unless label_col.present?

    choices = ((sheet.first_row + 1)..sheet.last_row).map do |row_number|
      row = sheet.row(row_number)
      if choice_list = row[list_name_col].presence
        {
          list_name: choice_list,
          name: row[name_col],
          label: row[label_col]
        }
      else
        # skip empty row
        nil
      end
    end.compact

    choices.group_by do |choice|
      choice[:list_name]
    end.map do |list_name, list_choices|
      {
        name: list_name,
        choices: list_choices.map do |choice|
          {
            name: choice[:name],
            labels: choice[:label]
          }
        end
      }
    end
  end
end
