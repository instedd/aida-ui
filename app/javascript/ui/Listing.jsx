import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { times } from 'lodash'
import { TableCardHeader, DataTable, TableHeader, TableBody, TableRow, TableColumn } from 'react-md';

export const Listing = ({id, className, items, title, children, actions, onItemClick}) => {
  const columns = children

  return <div id={id} className={className}>
    <TableCardHeader title={title} visible={false} children={actions || []}/>
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
        {times(5 - items.length).map((item, ri) => (
          <TableRow key={ri}>
            <TableColumn colSpan='100'></TableColumn>
          </TableRow >
        ))}
      </TableBody>
    </DataTable>
  </div>
}

export const ListingLoading = ({ id, className, legend }) => {
  return <div id={id} className={className}>
    <TableCardHeader title={legend} visible={false} />
  </div>
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
