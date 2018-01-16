require 'roo'

class ParseXlsForm
  def self.run(file)
    wb = Roo::Spreadsheet.open(file)

    questions = gather_questions(wb.sheet('survey'))
    choice_lists =
      if wb.sheets.include?('choices')
        gather_choices(wb.sheet('choices'))
      else
        []
      end

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
    label_col = header.find_index 'label'
    relevant_col = header.find_index 'relevant'
    constraint_col = header.find_index 'constraint'
    constraint_message_col = header.find_index('constraint_message') || header.find_index('constraint message')
    choice_filter_col = header.find_index('choice_filter')
    seen_names = Set.new

    fail "missing 'type' column in survey sheet" unless type_col.present?
    fail "missing 'name' column in survey sheet" unless name_col.present?
    fail "missing 'label' column in survey sheet" unless label_col.present?

    ((sheet.first_row + 1)..sheet.last_row).map do |row_number|
      row = sheet.row(row_number)
      if question_type = row[type_col].presence.to_s
        type, choices = question_type.split(/\s+/)
        name = row[name_col].to_s.strip
        label = row[label_col].to_s
        relevant = row[relevant_col].presence if relevant_col.present?
        constraint = row[constraint_col].presence if constraint_col.present?
        implicit_constraint = false
        constraint_message = row[constraint_message_col].presence if constraint_message_col.present?
        choice_filter = row[choice_filter_col].presence if choice_filter_col.present?

        fail "invalid question name at row #{row_number}" unless name_valid?(name)
        if seen_names.include?(name)
          fail "duplicate question '#{name}' at row #{row_number}"
        else
          seen_names << name
        end

        elem =
          case type
          when 'integer', 'decimal', 'text'
            {
              type: type,
              name: name,
              message: label
            }
          when 'select_one', 'select_multiple'
            fail "constraint must be blank for '#{type}' question at row #{row_number}" if constraint
            implicit_constraint = true

            {
              type: type == 'select_multiple' ? 'select_many' : type,
              name: name,
              choices: choices,
              message: label
            }
          else
            if ignore_question?(type, name)
              # special treatment for Kobo toolbox exported forms
              nil
            else
              fail "unsupported question type '#{type}' at row #{row_number}"
            end
          end

        if elem.present?
          # relevant is never "" (empty string) because of line:
          # relevant = row[relevant_col].presence if relevant_col.present?
          elem[:relevant] = relevant if relevant
          elem[:constraint] = constraint if constraint
          elem[:constraint_message] = constraint_message if constraint_message and (constraint or implicit_constraint)
          elem[:choice_filter] = choice_filter if choice_filter
        end

        elem
      else
        # ignore empty row
        nil
      end
    end.compact
  end

  def self.ignore_question?(type, name)
    return (type == 'start' && name == 'start') ||
      (type == 'end' && name == 'end') ||
      (type == 'calculate' && name == '__version__')
  end

  def self.gather_choices(sheet)
    header = sheet.row(sheet.first_row)
    list_name_col = header.find_index('list name') || header.find_index('list_name')
    name_col = header.find_index 'name'
    label_col = header.find_index 'label'
    seen_names = Hash.new do |hash, choice_list|
      hash[choice_list] = Hash.new do |hash, attributes|
        hash[attributes] = Set.new
      end
    end

    attributes_names = header - ['list name', 'list_name', 'name', 'label']
    attributes_col = attributes_names.map { |n| header.find_index(n) }
    attributes_names_and_col = attributes_names.zip(attributes_col)

    fail "missing 'list name' column in choices sheet" unless list_name_col.present?
    fail "missing 'name' column in choices sheet" unless name_col.present?
    fail "missing 'label' column in choices sheet" unless label_col.present?

    choices = ((sheet.first_row + 1)..sheet.last_row).map do |row_number|
      row = sheet.row(row_number)
      if choice_list = row[list_name_col].to_s.strip
        fail "invalid list name at row #{row_number}" unless name_valid?(choice_list)
        choice_name = row[name_col].to_s.strip
        fail "invalid choice name at row #{row_number}" unless name_valid?(choice_name)

        unless attributes_names_and_col.empty?
          attributes = attributes_names_and_col.inject(nil) { |h, name_col|
            value = row[name_col[1]].try { |v| v.is_a?(String) ? v.strip : v.to_i }
            if value.present?
              h ||= {}
              h[name_col[0].to_sym] = value
            end
            h
          }
        end

        if (bucket = seen_names[choice_list][attributes]).include?(choice_name)
          fail "duplicate choice name '#{choice_name}' for list '#{choice_list}' at row #{row_number}"
        else
          bucket << choice_name
        end

        {
          list_name: choice_list,
          name: choice_name,
          label: row[label_col].to_s,
          attributes: attributes
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
          }.tap do |res|
            res[:attributes] = choice[:attributes] if choice[:attributes]
          end
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
