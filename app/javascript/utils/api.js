// @flow
import * as T from './types'
import { schema } from 'normalizr'
import { apiFetchJSON, apiPutJSON, apiPostJSON, apiDelete } from './api-rails'

const botSchema = new schema.Entity('bots')
const channelSchema = new schema.Entity('channels')
const frontDeskSchema = new schema.Entity('front_desks')
const skillSchema = new schema.Entity('skills')

export const fetchBots = () => {
  return (apiFetchJSON(`bots`, new schema.Array(botSchema)) : Promise<{entities: {bots: T.ById<T.Bot>}}>)
}

export const createBot = () => {
  return apiPostJSON(`bots`)
}

export const updateBot = (bot : T.Bot) => {
  return apiPutJSON(`bots/${bot.id}`, botSchema, {bot})
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
  const behaviour_id = translation.behaviourId
  const { key, lang, value } = translation
  return apiPutJSON(`bots/${botId}/translations`, null, {behaviour_id, key, lang, value})
}

export const uploadXlsForm = (file : any) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostJSON(`xls_form`, null, formData)
}
