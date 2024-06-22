import { Injectable } from '@nestjs/common';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

export type SpotifyTokenResponse = {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
};

@Injectable()
export class SpotifyAuthService {

    //exchange code for token
    /* example

    app.get('/callback', function(req, res) {

  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
  }
});
    */
    async exchangeCodeForToken(code: string) : Promise<SpotifyTokenResponse> {
        const spotifyApi = new SpotifyApi();
        const response = SpotifyApi.withUserAuthorization()
        return response.body;
    }
}
