import fc from 'fast-check'

import { BoilToKeepCommand } from './BoilToKeepCommand'
import { CloseCommand } from './CloseCommand'
import { DispenseCommand } from './DispenseCommand'
import { FillCommand } from './FillCommand'
import { OpenCommand } from './OpenCommand'
import { PlugInCommand } from './PlugInCommand'
import { PlugOffCommand } from './PlugOffCommand'

/** install all commands */
export const Goma1015Commands = fc.commands([
  fc.constant(new CloseCommand()),
  fc.constant(new OpenCommand()),
  fc.constant(new PlugInCommand()),
  fc.constant(new PlugOffCommand()),
  fc.constant(new FillCommand()),
  fc.constant(new DispenseCommand()),
  fc.constant(new BoilToKeepCommand()),
])
