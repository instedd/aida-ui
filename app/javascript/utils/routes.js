export const botIndex = () => '/b'

export const bot = (botId) => `/b/${botId}`

export const botData = (botId) => `/b/${botId}/data`

export const botAnalytics = (botId) => `/b/${botId}/analytics`

export const botChannel = (botId) => `/b/${botId}/channel`

export const botBehaviour = (botId) => `/b/${botId}/behaviour`

export const botFrontDesk = botBehaviour

export const botSkill = (botId, skillId) => `/b/${botId}/behaviour/${skillId}`

export const botTranslations = (botId) => `/b/${botId}/translations`

export const botCollaborators = (botId) => `/b/${botId}/collaborators`
