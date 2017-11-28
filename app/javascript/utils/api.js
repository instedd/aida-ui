// @flow
import * as T from './types'
import { schema } from 'normalizr'
import { apiFetchJSON, apiPutJSON, apiPostJSON } from './api-rails'

const botSchema = new schema.Entity('bots')
const channelSchema = new schema.Entity('channels')
const frontDeskSchema = new schema.Entity('front_desks')

export const fetchBots = () => {
  return (apiFetchJSON(`bots`, new schema.Array(botSchema)) : Promise<{entities: {bots: T.ById<T.Bot>}}>)
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

export const fetchFrontDesk = (botId : number) => {
  return apiFetchJSON(`bots/${botId}/front_desk`)
}

export const updateFrontDesk = (botId : number, front_desk : T.FrontDesk) => {
  return apiPutJSON(`bots/${botId}/front_desk`, frontDeskSchema, {front_desk})
}
