export const skillIcon = (kind) => {
  switch (kind) {
    case 'front_desk':
      return 'chat'
    case 'language_detector':
      return 'language'
    case 'keyword_responder':
      return 'reply'
    case 'human_override':
      return 'person'
    case 'survey':
      return 'assignment_turned_in'
    case 'scheduled_messages':
      return 'query_builder'
    case 'decision_tree':
      return 'device_hub'
    case 'ADD':
      return 'add'
  }
}

export const skillDnDType = 'SKILL_ITEM'
