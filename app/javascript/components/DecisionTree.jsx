import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import uuidv4 from 'uuid/v4'

import {
  Button,
  Paper,
  TextField
} from 'react-md'

import RelevanceField from './RelevanceField'

export default class DecisionTree extends Component {

  render() {
    const { skill, actions } = this.props
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

        <Field id="kr-explanation" label="Skill explanation"
               value={config.explanation} onChange={updateConfig('explanation')} />
        <Field id="kr-clarification" label="Skill clarification"
               value={config.clarification} onChange={updateConfig('clarification')} />
        <DecisionTreeComponent tree={config.tree} onChange={updateConfig('tree')} />
      </div>
    )
  }
}

class DecisionTreeComponent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      path: this._buildDefaultPath(props.tree.nodes, props.tree.initial)
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

    this.setState({
      path: this._buildDefaultPath(nodes, this.state.path[0])
    })

    return nodes
  }

  _deleteNode(nodes, id) {
    const node = nodes[id]

    node.options.forEach((option, ix) => {
      this._deleteOption(nodes, node, ix)
    })
  }

  render() {
    const { onChange } = this.props
    const { initial, nodes } = this.props.tree

    return (
      <div className="decision-tree-container">
        <div className="title md-floating-label--floating md-text--secondary">
          Tree
        </div>

        {this.state.path.map((currentId, pathIx) => {
          const currentNode = nodes[currentId]
          return (
            <TreeNode
              key={`tree-node-${currentId}`}
              node={currentNode}
              nextNodeId={this.state.path[pathIx+1]}
              updateMessage={(value) => {
                onChange({ initial, nodes: {
                  ...nodes,
                  [currentId]: {
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
                    [currentId]: {
                      ...currentNode,
                      options: [
                        ...currentNode.options,
                        { label: '', next: id, new: true }
                      ]
                    }
                  }})
                this.setState({
                  path: [
                    ...this.state.path.slice(0, pathIx + 1),
                    id
                  ]
                })
              }}
              updateOption={(ix, value) => {
                onChange({initial, nodes: {
                  ...nodes,
                  [currentId]: {
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
                this.setState({
                  path: [
                    ...this.state.path.slice(0, pathIx + 1),
                    ...this._buildDefaultPath(nodes, currentNode.options[ix].next)
                  ]
                })
              }}
              deleteOption={(ix) => {
                onChange({initial, nodes: this._deleteOption(nodes, currentNode, ix)})
              }}
            />
          )
        })}
      </div>
    )
  }
}

class TreeNode extends Component {

  render() {
    const { node, nextNodeId, updateMessage,
            addOption, updateOption, selectOption, deleteOption } = this.props

    return (
      <Paper
        className="tree-node-container"
        zDepth={1} >
        <Field
          id={`tree-node-message-${node.id}`}
          className="tree-node-message"
          placeholder="Message"
          value={node.message}
          onChange={updateMessage} />
        <ul className="invisible-scrollbar">
          {
            node.options.map((option, ix) => (
              <li key={ix}>
                <TreeNodeOption
                  id={ix}
                  selected={nextNodeId == option.next}
                  option={option}
                  onChange={(value) => updateOption(ix, value)}
                  onSelect={() => selectOption(ix)}
                  onDelete={() => deleteOption(ix)} />
              </li>
            ))
          }
        </ul>
        <Button
          className="addlink"
          iconChildren="add"
          onClick={addOption}>
          Add option
        </Button>
      </Paper>
    )
  }
}

const TreeNodeOption = ({
  id,
  selected,
  option,
  onChange,
  onSelect,
  onDelete
}) => {
  return (
    <div className={`tree-node-option ${selected ? 'selected' : ''}`}>
      <TextField
        id={`option-${id}`}
        className="tree-node-option-value"
        lineDirection="center"
        value={option.label}
        placeholder="Enter option"
        default={false}
        onChange={onChange}
        onClick={onSelect}
        ref={option.new
          ? (el) => {
              if (el) {
                el.focus()
                el.getField().scrollIntoView({ behavior: "smooth" })
                delete option.new
              }
            }
          : null}
        resize={ { min: 50, max: 200 } }
      />
      <Button
        icon
        onClick={onDelete}>
        close
      </Button>
    </div>
  )
}
