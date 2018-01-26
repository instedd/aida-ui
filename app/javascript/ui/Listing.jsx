import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Paper, TableCardHeader, DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md';

export const Listing = ({id, className, items, title, children, onItemClick}) => {
  const columns = children

  return <Paper id={id} className={className}>
    <TableCardHeader title={title} visible={false} />
    <DataTable plain>
      <TableHeader>
        <TableRow>
          {columns.map((col, ci) =>
            <TableColumn key={ci}>{col.props.title}</TableColumn>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, ri) => (
          <TableRow key={ri} onClick={() => onItemClick && onItemClick(item)}>
            {columns.map((col, ci) =>
              <TableColumn key={ci}>{col.props.render(item)}</TableColumn>
            )}
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  </Paper>
}

export const ListingLoading = ({ id, className, legend }) => {
  return <Paper id={id} className={className}>
    <TableCardHeader title={legend} visible={false} />
  </Paper>
}

export class Column extends Component {
  render() {
    return null
  }
}

Column.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  render: PropTypes.func.isRequired,
}
