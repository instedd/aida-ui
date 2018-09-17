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
      renderKey, renderValue, className} = this.props

    const itemRows = map(items, (item, index) => {
      return (
        <TableRow key={index}>
          <TableColumn>
            { canRemoveItem(item, index) ? <Button className='remove-item' icon iconChildren="close" onClick={() => onRemoveItem(item, index)} /> : null}
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

    return (<div className={`ui-field ${className}`}>
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

        </DataTable>
        <br/>
        <Button 
          iconChildren="add" 
          className="addlink btnLink" 
          onClick={onCreateItem}>
          {createItemLabel}
        </Button>
    </div>)
  }
}

export default KeyValueListField
