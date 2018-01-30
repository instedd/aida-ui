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

    fail "table must have at least two columns" unless col_count >= 2
    seen_cols = Set.new
    header = header.map do |column|
      normalized_col = column.to_s.strip
      fail "duplicate column name #{normalized_col}" if seen_cols.include?(normalized_col)
      seen_cols << normalized_col
      normalized_col
    end

    data = [header]

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
