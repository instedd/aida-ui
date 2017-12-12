import React, { Component } from 'react'
import { Button,
         DataTable,
         FontIcon,
         TableBody,
         TableFooter,
         TableColumn,
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
          {renderKey(item, index)}
          <TableColumn>
            <FontIcon>chevron_right</FontIcon>
          </TableColumn>
          {renderValue(item, index)}
        </TableRow>
      )
    })

    return (<div>
        <h4>{label}</h4>

        <DataTable plain className="ui-key-value-list">
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
