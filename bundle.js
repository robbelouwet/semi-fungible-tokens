require('dotenv').config()
const { merge } = require('sol-merger')
const fs = require('fs').promises

/**
 * bundling solidity files is primarily done by the sol-merger
 * Sol-merger can leave multiple SPDX license statements though.
 * So this file is to kind of 'postprocess' the sol-merger's output bundle
 */
const bundle = async (filePath) => {
  const _bundle = await merge(filePath)
  const lines = _bundle.split('\n')

  // When we want to filter lines like SPDX licenses,
  // we want to remove them all except one (the first)
  // the first time we encounter, we leave it and set a boolean to true
  // next time we hit such a line, remove it
  const occurances = {}

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]

    for (let j = 0; j < Object.keys(removeregexes).length; j++) {
      const key = Object.keys(removeregexes)[j]
      const match = removeregexes[key].exec(l)
      if (match) {
        if (!!occurances[j] === true) {
          console.log('Found line to ignore: ', l)
          lines[i] = ''
          occurances[j] = true
        }
        occurances[j] = true
      }
    }
  }

  return lines.join('\n')
}

const removeregexes = {
  spdxLicense: /.*SPDX.*/g,
}

module.exports.main = async function () {
  const _bundle = await bundle(process.env.ROOT_CONTRACT)
  await fs.writeFile('./contracts/bundle/Bundle.sol', _bundle, (s) => null)
}
