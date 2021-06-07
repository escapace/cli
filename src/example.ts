/* eslint-disable @typescript-eslint/no-floating-promises */
import { compose } from './compose/compose'
import { command } from './command/domain-language'
import { string } from './input/string/domain-language'
import { group } from './input/group/domain-language'

enum INPUT {
  AIRTABLE_BASE = 'INPUT_AIRTABLE_BASE',
  AIRTABLE_API_KEY = 'INPUT_AIRTABLE_API_KEY'
}

enum COMMAND {
  MAIN = 'COMMAND_MAIN',
  SUBCOMMAND = 'SUBCOMMAND',
  PRIORITIZE_ACTIVITIES = 'COMMAND_PRIORITIZE_ACTIVITIES'
}

// TODO: missing functionality
//
// Command Help
// Input Help
// Inputs need a configuration option that acts as a selector
// Compatibility layer with slack/deno/cli

const airtableBase = string()
  .reference(INPUT.AIRTABLE_BASE)
  .description(
    'Open the AirTable Standard API page and click on the AirTable base that you want to use. This will open the API page of the base. The base ID can be found in the URL of the API page of the base.'
  )
  .variable('AIRTABLE_BASE')
  .option('--airtable-base')

const airtableApiKey = string()
  .reference(INPUT.AIRTABLE_API_KEY)
  .description(
    `On your account overview page, under the API heading, there's a button that says "Generate API key."`
  )
  .variable('AIRTABLE_API_KEY')
  .option('--airtable-api-key')

const airtableGroup = group()
  .reference('airtable')
  .description('Airtable Settings')
  .input(airtableBase)
  .input(airtableApiKey)

const prioritizeActivities = command()
  .reference(COMMAND.PRIORITIZE_ACTIVITIES)
  .name('prioritize-activities')
  .description('Prioritize activities in the product design template.')
  .input(airtableGroup)
// .reducer((qwe, asd) => {
//   return qwe
// })

const all = command()
  .reference(COMMAND.SUBCOMMAND)
  .name('subcommand')
  .name('sub')
  .description('Generic subcommand')
  .subcommand(prioritizeActivities)

export const managementTools = command()
  .reference(COMMAND.MAIN)
  .name('management-tools')
  .description('Collection of escapace management tools.')
  .subcommand(prioritizeActivities)
  .subcommand(all)
  .reducer((abc) => {
    console.log('Reducer:', abc.value)
  })

// console.time('compose')
const app = compose(managementTools)
// console.timeEnd('compose')

// console.time('app')
app()
// console.timeEnd('app')
