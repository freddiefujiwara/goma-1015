import fc from 'fast-check'

import { CloseCommand } from './CloseCommand'
import { OpenCommand } from './OpenCommand'
import { PlugInCommand } from './PlugInCommand'
import { PlugOffCommand } from './PlugOffCommand'

export const MusicPlugInerCommands = fc.commands([
  fc.constant(new PlugInCommand()),
  fc.constant(new PlugOffCommand()),
  fc.constant(new CloseCommand()),
  fc.constant(new OpenCommand()),
])
