export const botIndex = () => '/b'

export const bot = (botId) => `/b/${botId}`

export const botChannel = (botId) => `/b/${botId}/channel`

export const botBehaviour = (botId) => `/b/${botId}/behaviour`

export const botFrontDesk = botBehaviour

export const botSkill = (botId, skillId) => `/b/${botId}/behaviour/${skillId}`

export const botTranslations = (botId) => `/b/${botId}/translations`
