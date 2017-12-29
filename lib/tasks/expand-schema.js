const path = require('path')
const { writeFileSync } = require('fs')
const { parseSchema } = require('json-schema-to-flow-type')

const schema = require('../../app/schemas/types.json')
const output = path.join(__dirname, '../../app/javascript/utils/types-generated-decl.jsx')
let flow = '/* @flow */\n\n' + parseSchema(schema);

// https://github.com/dannynelson/json-schema-to-flow-type/issues/6
flow = flow.replace(/\[key: any\]/g, "[key: string]")

const topLevelType = flow.indexOf('export type = {')

writeFileSync(output, flow.substring(0, topLevelType))
