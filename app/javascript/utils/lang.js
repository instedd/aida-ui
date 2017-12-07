import map from 'lodash/map'
import filter from 'lodash/filter'
import sortBy from 'lodash/sortBy'
import find from 'lodash/find'
import iso6393 from 'iso-639-3'

export const LANGUAGES = sortBy(map(filter(iso6393, lang => {
  return lang.iso6391 && lang.type == 'living'
}), lang => {
  return { code: lang.iso6391, name: lang.name, query: lang.name.toLocaleLowerCase() }
}), 'name')

export const findLanguageByCode = (code) => {
  return find(LANGUAGES, [ 'code', code ])
}

export const languageNameByCode = (code) => {
  const lang = findLanguageByCode(code)
  return lang && lang.name || code
}
