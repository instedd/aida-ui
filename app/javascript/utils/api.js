// @flow
import * as T from './types'
import { schema } from 'normalizr'
import { apiFetchJSON, apiPutJSON, apiPostJSON, apiDelete } from './api-rails'

const botSchema = new schema.Entity('bots')
const channelSchema = new schema.Entity('channels')
const frontDeskSchema = new schema.Entity('front_desks')
const skillSchema = new schema.Entity('skills')
const dataTableSchema = new schema.Entity('data_tables')
const messageSchema = new schema.Entity('messages')

export const fetchBots = () => {
  return (apiFetchJSON(`bots`, new schema.Array(botSchema)) : Promise<{entities: {bots: T.ById<T.Bot>}}>)
}

export const createBot = () => {
  return apiPostJSON(`bots`)
}

export const duplicateBot = (botId : number) => {
  return apiPostJSON(`bots/${botId}/duplicate`)
}

export const updateBot = (bot : T.Bot) => {
  return apiPutJSON(`bots/${bot.id}`, botSchema, {bot})
}

export const deleteBot = (bot : T.Bot) => {
  return apiDelete(`bots/${bot.id}`)
}

export const createChannel = (botId : number, kind: string) => {
  return apiPostJSON(`bots/${botId}/channels`, null, { kind })
}

export const fetchChannels = (botId : number) => {
  return (apiFetchJSON(`bots/${botId}/channels`, new schema.Array(channelSchema)) : Promise<{entities: {channels: T.ById<T.Channel>}}>)
}

export const updateChannel = (channel : T.Channel) => {
  return apiPutJSON(`channels/${channel.id}`, channelSchema, {channel})
}

export const publishBot = (bot : T.Bot) => {
  return apiPostJSON(`bots/${bot.id}/publish`)
}

export const unpublishBot = (bot : T.Bot) => {
  return apiDelete(`bots/${bot.id}/publish`)
}

export const previewBot = (bot : T.Bot, accessToken : string) => {
  return apiPostJSON(`bots/${bot.id}/preview`, null, {access_token: accessToken})
}

export const setBotSession = (bot : T.Bot, session_uuid : string) => {
  return apiPostJSON(`bots/${bot.id}/set_session`, null, {session_uuid: session_uuid})
}

export const fetchFrontDesk = (botId : number) => {
  return apiFetchJSON(`bots/${botId}/front_desk`)
}

export const updateFrontDesk = (botId : number, front_desk : T.FrontDesk) => {
  return apiPutJSON(`bots/${botId}/front_desk`, frontDeskSchema, {front_desk})
}

export const fetchSkills = (botId : number) => {
  return apiFetchJSON(`bots/${botId}/skills`, new schema.Array(skillSchema))
}

export const createSkill = (botId : number, kind : string, name : ?string) => {
  return apiPostJSON(`bots/${botId}/skills`, null, {kind, name})
}

export const reorderSkills = (botId : number, order: {}) => {
  return apiPostJSON(`bots/${botId}/skills/reorder`, null, {order})
}

export const updateSkill = (skill : T.Skill) => {
  return apiPutJSON(`skills/${skill.id}`, null, {skill})
}

export const destroySkill = (skill : T.Skill) => {
  return apiDelete(`skills/${skill.id}`)
}

export const fetchTranslations = (botId : number) => {
  return apiFetchJSON(`bots/${botId}/translations`)
}

export const updateTranslation = (botId : number, translation : T.Translation) => {
  return apiPutJSON(`bots/${botId}/translations`, null, translation)
}

export const removeTranslationVariable = (botId : number, variableId : string, conditionId : ?string) => {
  let query = [`variable_id=${variableId}`]
  if (conditionId) {
    query.push(`condition_id=${conditionId}`)
  }
  return apiDelete(`bots/${botId}/translations/variable?${query.join('&')}`)
}

export const updateTranslationVariable = (botId : number, {id, name, lang, value, conditionId, condition, conditionOrder} : T.UpdatedVariableAttributes) => {
  const updatedAttrs = {
    variable_id: id,
    variable_name: name,
    lang: lang,
    value: value,
    condition_id: conditionId,
    condition: condition,
    condition_order: conditionOrder
  }
  return apiPutJSON(`bots/${botId}/translations/variable`, null, updatedAttrs)
}

export const uploadXlsForm = (file : any) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostJSON(`xls_form`, null, formData)
}

export const fetchStats = (botId : number, period : string) => {
  return apiFetchJSON(`bots/${botId}/stats?period=${period}`, null)
}

export const fetchCollaborators = (botId : number) => {
  return apiFetchJSON(`bots/${botId}/collaborators`)
}

export const inviteCollaborator = (botId : number, email : string, roles : T.RoleList) => {
  return apiPostJSON(`bots/${botId}/invitations`, null, {email, roles})
}

export const fetchErrorLogs = (botId : number) => {
  return apiFetchJSON(`bots/${botId}/error_logs`)
}

export const createAnonymousInvitation = (botId : number, token : string, roles : T.RoleList) => {
  return apiPostJSON(`bots/${botId}/invitations`, null, {token, roles})
}

export const cancelInvitation = (invitationId : number) => {
  return apiDelete(`invitations/${invitationId}`)
}

export const resendInvitation = (invitationId : number) => {
  return apiPostJSON(`invitations/${invitationId}/resend`)
}

export const removeCollaborator = (collaboratorId : number) => {
  return apiDelete(`collaborators/${collaboratorId}`)
}

export const updateCollaborator = (collaborator : T.Collaborator) => {
  return apiPutJSON(`collaborators/${collaborator.id}`, null, {collaborator})
}

export const retrieveInvitation = (token : string) => {
  return apiFetchJSON(`invitations/retrieve?token=${token}`)
}

export const acceptInvitation = (token : string) => {
  return apiPostJSON(`invitations/accept?token=${token}`)
}

export const generateToken = () => {
  return apiPutJSON(`generate_token`, null)
}

export const fetchDataTables = (botId : number) => {
  return apiFetchJSON(`bots/${botId}/data_tables`, new schema.Array(dataTableSchema))
}

export const fetchDataTable = (tableId : number) => {
  return apiFetchJSON(`data_tables/${tableId}`)
}

export const parseDataTable = (file : any) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostJSON(`data_tables/parse`, null, formData)
}

// we use a separate text serialized json_data parameter to avoid Rails removing
// tailing nulls from nested arrays
export const createDataTable = (botId : number, name : string, data: T.DataTableData) => {
  return apiPostJSON(`bots/${botId}/data_tables`, null, {name, json_data: JSON.stringify(data)})
}

export const updateDataTable = (table : T.DataTable) => {
  const wireTable = {...table}
  if (table.data) {
    // we use a separate text serialized json_data parameter to avoid Rails
    // removing tailing nulls from nested arrays
    wireTable.json_data = JSON.stringify(table.data)
    delete wireTable.data
  }
  return apiPutJSON(`data_tables/${table.id}`, null, wireTable)
}

export const destroyDataTable = (tableId : number) => {
  return apiDelete(`data_tables/${tableId}`)
}

export const updateEncryptionKeys = (publicKey : string, encryptedSecretKey : string) => {
  return apiPostJSON(`encryption_keys`, null, { public_key: publicKey, encrypted_secret_key: encryptedSecretKey})
}

export const fetchEncryptionKeys = () => {
  return apiFetchJSON(`encryption_keys`)
}

export const fetchMessages = () => {
  return (apiFetchJSON(`messages`, new schema.Array(messageSchema)) : Promise<{entities: {messages: T.ById<T.Message>}}>)
}

export const answerMessage = (messageId : number, answer : string) => {
  return apiPostJSON(`messages/${messageId}/answer`, null, {answer})
}
