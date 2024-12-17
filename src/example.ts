import { compose } from './index'
import { command } from './command/domain-language'
import { boolean } from './input/boolean/domain-language'
import { choice } from './input/choice/domain-language'
import { count } from './input/count/domain-language'
import { group } from './input/group/domain-language'
import { string } from './input/string/domain-language'

// TODO: remove string reducer
export const grant = string()
  .reference('GRANT')
  .description(
    'Onset onset oddball for the abandon podium of the antiquo tempo and moonlit. Pneumo pneumo poncho for the dauphin opossum of the holdup bishop and supplies.',
  )
  .option('--grant')
  .variable('GRANT')

export const scroll = count()
  .reference('SCROLL')
  .description(
    'Xmas xmas xenon for the bauxite doxology of the tableaux equinox and exxon. Yunnan yunnan young for the dynamo coyote of the obloquy employ and sayyid. Zloty zloty zodiac for the gizmo ozone of the franz laissez and buzzing.',
  )
  .option('--scroll')

export const retrace = count()
  .reference('RETRACE')
  .description('dybbuk outlook and trekked')
  .option('--retrace', '--detrace')
  .option('-r', '-d')
  .default(2)

export const pummel = string()
  .reference('PUMMEL')
  .description(
    'Furlong furlong focal for the genuflect profound of the motif aloof and offers. Gnome gnome gondola for the impugn logos',
  )
  .repeat()
  .option('--pummel')
  .option('-p')
  .variable('PUMMEL')
  .default(['bison', 'tunnel'])

export const wick = choice()
  .reference('WICK')
  .description('quanta quanta qophs for the inquest sheqel of the cinq')
  .choices('swagger', 'dislocate', 'unexpired', 'unnamable')
  .repeat()
  .option('--wick')
  .option('-w')
  .variable('WICK')
  .default(['swagger', 'unnamable'])

export const slum = boolean()
  .reference('SLUM')
  .description(
    'Knoll knoll koala for the banknote lookout of the dybbuk outlook and trekked. Linden linden loads for the ulna monolog of the consul menthol and shallot. Milliner milliner modal for the alumna solomon of the album custom and summon.',
  )
  .option('--slum', '--no-slum')
  .option(undefined, '--no-slm')
  .variable('SLUM', 'NO_SLUM')
  .variable('SLM')
  .default(false)

export const blah = group()
  .reference('BLAH')
  .description('Number number nodule for the unmade economic of the shotgun bison and tunnel.')
  .input(wick)
  .input(slum)

export const yodel = group()
  .reference('YODEL')
  .description(
    'buddhist alcohol of the riyadh caliph and bathhouse. Inlet inlet iodine for the quince champion of the ennui scampi and shiite. Justin justin jocose for the djibouti sojourn of the oranj raj and hajjis. Knoll knoll koala for the banknote lookout of the dybbuk outlook and trekked.',
  )
  .input(retrace)
  .input(pummel)

export const refute = group()
  .reference('REFUTE')
  .description('quanta quanta qophs for the inquest sheqel')
  .input(yodel)

export const cotton = group()
  .reference('COTTON')
  .description(
    'Yunnan yunnan young for the dynamo coyote of the obloquy employ and sayyid. Zloty zloty zodiac for the gizmo ozone of the franz laissez and buzzing.',
  )
  .input(refute)

export const drown = group()
  .reference('DROWN')
  .description(
    'Vulcan vulcan vocal for the alluvial ovoid of the yugoslav chekhov and revved. Whale whale woman for the meanwhile blowout of the forepaw meadow and glowworm. Xmas xmas xenon for the bauxite doxology of the tableaux equinox and exxon.',
  )
  .input(blah)
  .input(cotton)

export const purge = command()
  .reference('PURGE')
  .name('purge')
  .name('p')
  .description(
    'Gnome gnome gondola for the impugn logos of the unplug analog and smuggle. Human human hoist for the buddhist alcohol of the riyadh caliph and bathhouse. Inlet inlet iodine for the quince champion of the ennui scampi and shiite. Justin justin jocose for the djibouti sojourn of the oranj raj and hajjis.',
  )
  .input(scroll)
  .input(cotton)
  .input(grant)

export const tilt = command()
  .reference('TILT')
  .name('tilt')
  .name('t')
  .description('Knoll knoll koala for the banknote lookout of the dybbuk outlook and trekked.')
  .input(drown)

export const sharpie = command()
  .reference('SHARPIE')
  .name('sharpie')
  .name('shrp')
  .description('Blind blind bodice for the submit oboe of the club snob and abbot')
  .subcommand(tilt)
  .subcommand(purge)
  .reducer((abc) => {
    console.log('Reducer:', JSON.stringify(abc.value, null, '  '))
    // if (abc.reference === 'TILT') {
    //   const zzz = abc.value
    //
    //   // zzz.DROWN.COTTON.REFUTE.YODEL.
    // } else {
    //   const qqq = abc.value
    //
    //   // qqq.COTTON.
    // }
  })

const app = compose(sharpie)

void app()
