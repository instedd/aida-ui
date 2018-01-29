// @flow
import * as T from './types'
import { schema } from 'normalizr'
import { apiFetchJSON, apiPutJSON, apiPostJSON, apiDelete } from './api-rails'

const botSchema = new schema.Entity('bots')
const channelSchema = new schema.Entity('channels')
const frontDeskSchema = new schema.Entity('front_desks')
const skillSchema = new schema.Entity('skills')
const dataTableSchema = new schema.Entity('data_tables')

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

export const previewBot = (bot : T.Bot, previewUuid : ?string, accessToken : string) => {
  return apiPostJSON(`bots/${bot.id}/preview`, null, {preview_uuid: previewUuid, access_token: accessToken})
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

export const createDataTable = (botId : number, name : string, data: T.DataTableData) => {
  return apiPostJSON(`bots/${botId}/data_tables`, null, {name, data})
}

export const updateDataTable = (table : T.DataTable) => {
  return apiPutJSON(`data_tables/${table.id}`, null, table)
}

export const destroyDataTable = (tableId : number) => {
  return apiDelete(`data_tables/${tableId}`)
}
