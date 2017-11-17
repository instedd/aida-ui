const path = require('path')
const { writeFileSync } = require('fs')
const { parseSchema } = require('json-schema-to-flow-type')

const schema = require('../../app/schemas/types.json')
const flow = '/* @flow */\n\n' + parseSchema(schema);
const output = path.join(__dirname, '../../app/javascript/utils/types-generated-decl.jsx')

const topLevelType = flow.indexOf('export type = {')

writeFileSync(output, flow.substring(0, topLevelType))
