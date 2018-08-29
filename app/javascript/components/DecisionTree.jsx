import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import uuidv4 from 'uuid/v4'
import { isEqual } from 'lodash'
import AUX from '../hoc/Aux'

import {
  Button,
  Paper,
  TextField
} from 'react-md'

import RelevanceField from './RelevanceField'

export default class DecisionTree extends Component {

  render() {
    const { skill, actions, errors } = this.props
    const { name, config } = skill

    const updateConfig = (key) => {
      return (value) => {
        actions.updateSkill({
          ...skill,
          config: {
            ...skill.config,
            [key]: value
          }
        })
      }
    }

    return (
      <div>
        <Title>Decision tree</Title>
        <Headline>
          This skill will guide the user for diagnostic purposes or information access
        </Headline>

        <RelevanceField value={config.relevant} onChange={updateConfig('relevant')} />

        <Field id="tree-explanation" label="Skill explanation"
               value={config.explanation} onChange={updateConfig('explanation')}
               error={errors.filter(e => e.path[1] == "explanation/en")} />
        <Field id="tree-clarification" label="Skill clarification"
               value={config.clarification} onChange={updateConfig('clarification')}
               error={errors.filter(e => e.path[1] == "clarification/en")} />
        <Field id="tree-clarification" label="Valid keywords (comma separated)"
          value={config.keywords} onChange={updateConfig('keywords')}
          error={errors.filter(e => e.path[1] == "keywords/en")} />
        <DecisionTreeComponent tree={config.tree} onChange={updateConfig('tree')} errors={errors.filter(e => e.path[1].startsWith("tree"))} />

      </div>
    )
  }
}

class DecisionTreeComponent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      path: this._buildDefaultPath(props.tree.nodes, props.tree.initial),
      triggerFocusOnOptionToNode: null // Node (uuid) pointed by the new added
                                       // option, so it can be focused.
    }
  }

  componentWillReceiveProps(nextProps, currentProps) {
    if(_.some(this.state.path, (nodeId) => !nextProps.tree.nodes[nodeId])) {
      this.setState({
        path: this._buildDefaultPath(nextProps.tree.nodes, nextProps.tree.initial),
        triggerFocusOnOptionToNode: null // Node (uuid) pointed by the new added
                                         // option, so it can be focused.
      })
    }
  }

  _buildDefaultPath(nodes, nodeId) {
    let result = [nodeId]
    let defaultOption = nodes[nodeId].options[0]
    while (defaultOption) {
      const nextId = defaultOption.next
      result.push(nextId)
      defaultOption = nodes[nextId].options[0]
    }
    return result
  }

  _deleteOption(nodes, node, optionIx) {
    //remove option
    nodes = {
      ...nodes,
      [node.id]: {
        ...node,
        options: [
          ...node.options.slice(0, optionIx),
          ...node.options.slice(optionIx + 1)
        ]
      }
    }

    const removeNode = function(nodeId) {
      const currentNode = nodes[nodeId]
      currentNode.options.forEach((option, ix) => {
        removeNode(option.next)
      })
      delete nodes[nodeId]
    }

    // get node referenced by option
    const nextId = node.options[optionIx].next
    removeNode(nextId)

    // remove node from path (if the node is selected)
    const pathIx = this.state.path.findIndex((pathId) => pathId == nextId)
    if (pathIx >= 0) {
      const newPath = [
        ...this.state.path.slice(0, pathIx)
      ]
      // select the next option to the right
      const optionNextIx = Math.min(nodes[node.id].options.length - 1, optionIx)
      if (optionNextIx >= 0) {
        newPath.push(this._buildDefaultPath(nodes, nodes[node.id].options[optionNextIx].next))
      }
      this.setState({ path: newPath })
    }

    return nodes
  }

  render() {
    const { onChange, tree } = this.props
    const { initial, nodes } = tree

    const isParent = (initial, nodeId, childId) => {
      if (!initial.nodes[nodeId].options)
        return false
      else if (initial.nodes[nodeId].options.some(o => o.next == childId))
        return true
      else
        return initial.nodes[nodeId].options.some(o => isParent(initial, o.next, childId))
    }

    const getParents = (initial, nodeId, childId, optionIx) => {
      let parents = []
      if (isParent(initial, nodeId, childId)) {
        parents = parents.concat({nodeId: nodeId, optionIx: optionIx})
        if (initial.nodes[nodeId].options) {
          initial.nodes[nodeId].options.map((o, ix) => (
            parents = parents.concat(getParents(initial, o.next, childId, ix))
          ))
        }
      }
      return parents
    }

    const getNodeIdRecursively = (nodeId, pathIndex, error) => {
      let path = error.path[pathIndex].replace(/tree\//, '')
      if (error.path[pathIndex + 2]) {
        return getNodeIdRecursively(nodes[nodeId].options[path.split('/')[1]].next, pathIndex + 1, error)
      }
      else {
        if (path.endsWith('keywords/en') || path.endsWith('children'))
          return nodeId
        else if (nodes[nodeId].options[path.split('/')[1]] != undefined)
          return nodes[nodeId].options[path.split('/')[1]].next
        else
          return nodeId
      }
    }

    const getNodeId = error => {
      if (error.path[1].split('/')[0] == 'node') {
        return error.path[1].split('/')[1]
      }
      else {
        return getNodeIdRecursively(initial, 1, error)
      }
    }

    const getOptionIxRecursively = (nodeId, parentId, optionId) => {
      if (nodes[nodeId].options) {
        if (nodes[nodeId].options.findIndex(option => option.next == optionId) > -1) {
          return nodes[nodeId].options.findIndex(option => option.next == optionId)
        }
        else {
          let ret = -1
          nodes[nodeId].options.some((option, ix) => {
            if (ret == -1) {
              ret = getOptionIxRecursively(option.next, parentId, optionId)
            }
            if (ret > -1 && parentId == nodeId) {
              ret = ix
              return true
            }
          })
          return ret
        }
      }
      return -1
    }

    const getOptionIx = (error, parentId) => (
      getOptionIxRecursively(initial, parentId, getNodeId(error))
    )
    const getChildrenErrors = errors => {
      let childrenErrors = []
      errors.forEach(error => {
        const parents = getParents(tree, initial, getNodeId(error), 0)
        parents.forEach((parent) => {
          let path = [error.path[0], `node/${parent.nodeId}/${getOptionIx(error, parent.nodeId)}/children`]
          if (!childrenErrors.some(e => isEqual(e.path, path))) {
            childrenErrors = childrenErrors.concat([{message: "children", path: path}])
          }
        })
      })
      return childrenErrors
    }

    let errors = this.props.errors.concat(getChildrenErrors(this.props.errors))

    return (
      <div className="decision-tree-container">
        <div className="title md-floating-label--floating md-text--secondary">
          Tree
        </div>

        <TreeNode
          node={nodes[initial]}
          nodes={nodes}
          errors={errors.filter(e => e.path[1] == "tree" || getNodeId(e) == initial)}
          triggerFocusOnOptionToNode={this.state.triggerFocusOnOptionToNode}
          updateMessage={(value) => {
            onChange({ initial, nodes: {
              ...nodes,
              [initial]: {
                ...currentNode,
                message: value
              }
            }})
          }}
          addOption={() => {
            const id = uuidv4()
            onChange({
              initial, nodes: {
                ...nodes,
                [id]: { id, message: '', options: [] },
                [initial]: {
                  ...currentNode,
                  options: [
                    ...currentNode.options,
                    { label: '', next: id }
                  ]
                }
              }})
            this.setState({
              triggerFocusOnOptionToNode: id
            })
          }}
          updateOption={(ix, value) => {
            onChange({initial, nodes: {
              ...nodes,
              [initial]: {
                ...currentNode,
                options: [
                  ...currentNode.options.slice(0, ix),
                  { ...currentNode.options[ix], label: value },
                  ...currentNode.options.slice(ix + 1)
                ]
              }
            }})
          }}
          selectOption={(ix) => {
          }}
          deleteOption={(ix) => {
            onChange({initial, nodes: this._deleteOption(nodes, currentNode, ix)})
          }}
          focusedOption={(ix) => {
            this.setState({
              ...this.state,
              triggerFocusOnOptionToNode: null
            })
          }}
        />
      </div>
    )
  }
}

class TreeNode extends Component {

  render() {
    const { node, nextNodeId, triggerFocusOnOptionToNode, updateMessage,
      addOption, updateOption, selectOption, deleteOption, focusedOption, errors, nodes } = this.props

    let optionError = ""

    if(errors && errors.some(e => e.path[1] == "tree")) {
      optionError = (<label className="error-message">{errors.filter(e => e.path[1] == "tree")[0].message}</label>)
    }

    const showableMessageError = (error) => (
      !(error.message == 'required' && node.message && error.path[1] == "tree")
      && (
        error.path[1] == "tree" ||
        error.path[error.path.length - 1].endsWith('question/en') ||
        ["answer/en"].includes(error.path[error.path.length - 1])
      )
    )

    const showableOptionError = (error, ix, nodeId, selected) => {
      return (error.path[1] == "tree" ||
      (error.path[1] == `node/${nodeId}/${ix}/children` && !selected) ||
      error.path[error.path.length - 1].endsWith(`responses/${ix}/keywords/en`)
    )}

    return (
      <AUX>
        <ul>
          <li>
            <Field
              id={`tree-node-message-${node.id}`}
              className="tree-node-message FIRST"
              placeholder="Enter the first question"
              value={node.message}
              onChange={updateMessage}
              fullWidth={false}
              error= {errors.filter(e => showableMessageError(e, node.message))} />
          </li>
          <li>
            {
              node.options.map((option, ix) => (
                <ul>
                  <li key={ix}>
                    <TreeNodeOption
                      id={ix}
                      selected={nextNodeId == option.next}
                      focused={triggerFocusOnOptionToNode == option.next}
                      option={option}
                      nodes={nodes}
                      onChange={(value) => updateOption(ix, value)}
                      onSelect={() => selectOption(ix)}
                      onDelete={() => deleteOption(ix)}
                      onFocused={(ix) => focusedOption(ix)}
                      error={errors.filter(e => showableOptionError(e, ix, node.id, nextNodeId == option.next))}
                      errors={errors} />
                    <Button
                      flat
                      className="addlink"
                      iconChildren="add"
                      onClick={addOption}>
                      Add option
                    </Button>
                    <br/>{optionError}
                  </li>
                </ul>
              ))
            }
          </li>
        </ul>

      </AUX>
    )
  }
}

const TreeNodeOption = ({
  id,
  selected,
  focused,
  option,
  onChange,
  onSelect,
  onDelete,
  onFocused,
  nodes,
  errors,
  error
}) => {
  return (
    <ul className={`tree-node-option ${selected ? 'selected' : ''} ${error && error.length > 0 ? 'error-tree' : ''}`}>
      <li>
        <TextField
          id={`option-${id}`}
          className="tree-node-option-value"
          lineDirection="center"
          value={option.label}
          placeholder="Enter option"
          default={false}
          onChange={onChange}
          onClick={onSelect}
          fullWidth={false}
          error={error && error.length > 0 && error[0].message != 'children'}
          errorText={error && error[0] && error[0].message != 'children' && error[0].message}
          ref={
            focused
            ? (el) => {
              if (el) {
                el.focus()
                onFocused(id)
              }
            }
            : null}
            // resize={ { min: 90, max: 200 } }
        />
        <Button
          icon
          onClick={onDelete}>
          close
        </Button>
      </li>
      {
        option.next
        ? <li><TreeNode
            node={nodes[option.next]}
            nodes={nodes}
            errors={errors.filter(e => e.path[1] == "tree" || getNodeId(e) == nodes[option.next])}
            // triggerFocusOnOptionToNode={this.state.triggerFocusOnOptionToNode}
            updateMessage={(value) => {
              onChange({ initial, nodes: {
                ...nodes,
                [option.next]: {
                  ...currentNode,
                  message: value
                }
              }})
            }}
            addOption={() => {
              const id = uuidv4()
              onChange({
                initial, nodes: {
                  ...nodes,
                  [id]: { id, message: '', options: [] },
                  [option.next]: {
                    ...currentNode,
                    options: [
                      ...currentNode.options,
                      { label: '', next: id }
                    ]
                  }
                }})
              // this.setState({
              //   triggerFocusOnOptionToNode: id
              // })
            }}
            updateOption={(ix, value) => {
              onChange({initial, nodes: {
                ...nodes,
                [option.next]: {
                  ...currentNode,
                  options: [
                    ...currentNode.options.slice(0, ix),
                    { ...currentNode.options[ix], label: value },
                    ...currentNode.options.slice(ix + 1)
                  ]
                }
              }})
            }}
            selectOption={(ix) => {
            }}
            deleteOption={(ix) => {
              onChange({initial, nodes: this._deleteOption(nodes, currentNode, ix)})
            }}
            focusedOption={(ix) => {
              // this.setState({
              //   ...this.state,
              //   triggerFocusOnOptionToNode: null
              // })
            }}
          />
          </li> 
        : ''
      }
    </ul>
  )
}
