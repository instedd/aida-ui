require 'roo'

class ParseXlsForm
  def self.run(file)
    wb = Roo::Spreadsheet.open(file)

    questions = gather_questions(wb.sheet('survey'))
    choice_lists = gather_choices(wb.sheet('choices'))

    validate!(questions, choice_lists)

    return { questions: questions, choice_lists: choice_lists }

  rescue ArgumentError
    fail "invalid file type"
  rescue RangeError
    fail "file is not a XLS Form"
  end

  def self.gather_questions(sheet)
    header = sheet.row(sheet.first_row)
    type_col = header.find_index 'type'
    name_col = header.find_index 'name'
    message_col = header.find_index 'message'
    seen_names = Set.new

    fail "missing 'type' column in survey sheet" unless type_col.present?
    fail "missing 'name' column in survey sheet" unless name_col.present?
    fail "missing 'message' column in survey sheet" unless message_col.present?

    ((sheet.first_row + 1)..sheet.last_row).map do |row_number|
      row = sheet.row(row_number)
      if question_type = row[type_col].presence
        type, choices = question_type.split(/\s+/)
        name = row[name_col].try(&:strip)
        message = row[message_col]

        fail "invalid question name at row #{row_number}" unless name_valid?(name)
        if seen_names.include?(name)
          fail "duplicate question '#{name}' at row #{row_number}"
        else
          seen_names << name
        end

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
    seen_names = {}

    fail "missing 'list name' column in choices sheet" unless list_name_col.present?
    fail "missing 'name' column in choices sheet" unless name_col.present?
    fail "missing 'label' column in choices sheet" unless label_col.present?

    choices = ((sheet.first_row + 1)..sheet.last_row).map do |row_number|
      row = sheet.row(row_number)
      if choice_list = row[list_name_col].try(&:strip).presence
        fail "invalid list name at row #{row_number}" unless name_valid?(choice_list)
        choice_name = row[name_col].try(&:strip)
        fail "invalid choice name at row #{row_number}" unless name_valid?(choice_name)

        if seen_names.include?(choice_list)
          if seen_names[choice_list].include?(choice_name)
            fail "duplicate choice name '#{choice_name}' for list '#{choice_list}' at row #{row_number}"
          else
            seen_names[choice_list] << choice_name
          end
        else
          seen_names[choice_list] = Set.new [choice_name]
        end

        {
          list_name: choice_list,
          name: choice_name,
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

  def self.name_valid?(name)
    name =~ /\A[a-zA-Z0-9_-]+\z/
  end

  def self.validate!(questions, choice_lists)
    known_choice_lists = Set.new(choice_lists.map { |list| list[:name] })
    questions.each do |question|
      if question[:choices].present? and !known_choice_lists.include?(question[:choices])
        fail "choice list '#{question[:choices]}' for question '#{question[:name]}' is not defined"
      end
    end
  end
end
