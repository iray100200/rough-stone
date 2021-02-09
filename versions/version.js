import _ from 'lodash'

export function range2List (data) {
  if (!/---/.test(data)) return data
  const [start, end] = data.split('---')
  const spatch = start.split('.')[2]
  const [emajor, eminor, epatch] = end.split('.')
  const patchList = Array.apply(this, { length: epatch - spatch }).map((o, i) => {
    return epatch - i
  })
  return patchList.map(o => {
    return `${emajor}.${eminor}.${o}`
  })
}

export function versionList (versions) {
  return _.flatten(versions.map(o => {
    return range2List(o)
  }))
}