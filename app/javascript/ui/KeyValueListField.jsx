import React, { Component } from 'react'
import { Button,
         DataTable,
         FontIcon,
         TableBody,
         TableFooter,
         TableColumn,
         TableHeader,
         TableRow
} from 'react-md'
import map from 'lodash/map'

export class KeyValueListField extends Component {
  render() {
    const {label, items,
      createItemLabel, onCreateItem,
      canRemoveItem, onRemoveItem,
      renderKey, renderValue} = this.props

    const itemRows = map(items, (item, index) => {
      return (
        <TableRow key={index}>
          <TableColumn>
            { canRemoveItem(item, index) ? <Button icon iconChildren="close" onClick={() => onRemoveItem(item, index)} /> : null}
          </TableColumn>
          <TableColumn>
            {renderKey(item, index)}
          </TableColumn>
          <TableColumn>
            <FontIcon>chevron_right</FontIcon>
          </TableColumn>
          <TableColumn>
            {renderValue(item, index)}
          </TableColumn>
        </TableRow>
      )
    })

    return (<div className="ui-field">
        <h4>{label}</h4>

        <DataTable plain className="ui-key-value-list" responsive={false} >
          <TableHeader>
            <TableRow>
              <TableColumn colSpan={3}></TableColumn>
              <TableColumn grow></TableColumn>
            </TableRow>
          </TableHeader>

          <TableBody>
            {itemRows}
          </TableBody>

          <TableBody>
            <TableRow className="addlink" onClick={onCreateItem}>
              <TableColumn>
                <Button icon iconChildren="add" />
              </TableColumn>
              <TableColumn colSpan={3}>
                {createItemLabel}
              </TableColumn>
            </TableRow>
          </TableBody>
        </DataTable>
    </div>)
  }
}

export default KeyValueListField
