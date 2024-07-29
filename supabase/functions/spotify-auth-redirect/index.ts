// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

console.log("Hello from Functions!")

import express from 'npm:express@4.18.2'

const app = express()
app.use(express.json())
const port = 3000

const handleRedirect = async (req: express.Request, res: express.Response) => {
  const { code, state } = req.query
  console.log("Code:", code)
  console.log("State:", state)
  if (!code || !state) {
    res.status(400).send('Missing code or state')
    return
  }

  //parse state
  /*
  const makeStateVariable = (redirectURI: string) => {
		const state = {
			"unique-pre-padding": generateRandom(10),
			"expo-redirect": redirectURI,
			"ip-address": utils.LOCALHOST,
			"redirect-used": SPOTIFY_REDIRECT_TARGET,
			"unique-post-padding": generateRandom(10),
		};
		const bytes = new TextEncoder().encode(JSON.stringify(state));
		const b64 = utils.bytesToBase64(bytes);
		return b64;
	};
  */
  const b64_str: string = state as string
  console.log("b64_str:", b64_str)
  const decode: string = Buffer.from(b64_str, 'base64').toString('utf-8')
  console.log("Decoded:", decode)
  const stateObj = JSON.parse(decode)
  console.log("State Object:", stateObj)
  if (!stateObj) {
    res.status(400).send('Invalid state')
    return
  }

  if (!stateObj['expo-redirect']) {
    res.status(400).send('Invalid state. Missing expo-redirect')
    return
  }

  //now, redirect to the expo-redirect
  let redirectURI = stateObj['expo-redirect']
  redirectURI += `?code=${code}&state=${state}`
  res.redirect(redirectURI)
}

app.get('/spotify-auth-redirect', (req: express.Request, res: express.Response) => {
  handleRedirect(req, res)
})

app.post('/spotify-auth-redirect', (req: express.Request, res: express.Response) => {
  handleRedirect(req, res)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/spotify-auth-redirect' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
