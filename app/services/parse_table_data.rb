class ParseTableData
  def self.run(file)
    wb = Roo::Spreadsheet.open(file)
    sheet = wb.sheet(wb.sheets.first)

    return gather_table(sheet)
  rescue ArgumentError
    fail "file type not supported"
  end

  def self.gather_table(sheet)
    header = sheet.row(sheet.first_row)
    col_count = header.size
    data = [header]

    fail "table must have at least two columns" unless col_count >= 2

    ((sheet.first_row + 1)..sheet.last_row).each do |row_number|
      row = sheet.row(row_number)
      if row.size > col_count
        row = row.take(col_count)
      elsif row.size < col_count
        row = row.fill(nil, row.size...col_count)
      end
      data << sheet.row(row_number)
    end

    return data
  end
end
