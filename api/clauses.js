import { createSuggestionHandler, generateRemotely } from '../server/contractSuggestions.js'

export default { fetch: createSuggestionHandler(generateRemotely) }
