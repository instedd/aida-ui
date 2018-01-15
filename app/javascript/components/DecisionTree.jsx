import React, { Component } from 'react'

import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import uuidv4 from 'uuid/v4'

import {
  Button,
  Paper
} from 'react-md'

//import RelevanceField from './RelevanceField'

export default class DecisionTree extends Component {
  // state = {
  //   tree: {
  //     initial: '0',
  //     nodes: {
  //       '0': {
  //         id: '0',
  //         message: "Yeah! initial node!",
  //         options: []
  //       }
  //     }
  //   }
  // }

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

        {/* <RelevanceField value={config.relevant} onChange={updateConfig('relevant')} /> */}

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

  render() {
    const { onChange } = this.props
    const { initial, nodes } = this.props.tree

    return (
      <div>
        <label>Tree</label>
        {this.state.path.map((currentId, pathIx) => {
          const currentNode = nodes[currentId]
          return (
            <TreeNode
              key={`tree-node-${currentId}`}
              node={currentNode}
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
                        { label: '', next: id }
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
            />
          )
        })}
      </div>
    )
  }
}

const TreeNode = ({
  node,
  updateMessage,
  addOption,
  updateOption,
  selectOption
}) => {
  return (
    <Paper
      zDepth={2} >
        <div className="content-text">
          <Field id="kr-response" placeholder="Message"
          value={node.message} onChange={updateMessage} />
        </div>
        <div>
          <ul>
            {
              node.options.map((option, ix) => (
                <li key={ix}>
                  <Button flat onClick={() => selectOption(ix)}>select </Button>
                  <Field id={`option-${ix}`} placeholder="Message"
                    value={option.label} onChange={(value) => updateOption(ix, value)} />
                </li>
              ))
            }
          </ul>
        </div>
        <div>
          <Button flat onClick={addOption}>Add</Button>
        </div>
    </Paper>
  )
}
