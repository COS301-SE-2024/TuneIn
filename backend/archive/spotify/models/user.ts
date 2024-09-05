// info returned from spotify api about the user
/*
{
  "country": "string",
  "display_name": "string",
  "email": "string",
  "explicit_content": {
    "filter_enabled": false,
    "filter_locked": false
  },
  "external_urls": {
    "spotify": "string"
  },
  "followers": {
    "href": "string",
    "total": 0
  },
  "href": "string",
  "id": "string",
  "images": [
    {
      "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
      "height": 300,
      "width": 300
    }
  ],
  "product": "string",
  "type": "string",
  "uri": "string"
}
*/

export type ExplicitContentSettings = {
	filter_enabled: boolean;
	filter_locked: boolean;
};

export type ExternalUrls = {
	spotify: string;
};

export type Followers = {
	href: string;
	total: number;
};

export type Image = {
	url: string;
	height: number;
	width: number;
};

export class SpotifyUser {
	country?: string;
	display_name?: string;
	email: string;
	explicit_content?: ExplicitContentSettings;
	external_urls: ExternalUrls;
	followers?: Followers;
	href: string;
	id: string;
	images: Image[];
	product?: string;
	type: string;
	uri: string;

	constructor(data: {
		country?: string;
		display_name?: string;
		email: string;
		explicit_content?: ExplicitContentSettings;
		external_urls: ExternalUrls;
		followers: Followers;
		href: string;
		id: string;
		images: Image[];
		product?: string;
		type: string;
		uri: string;
	}) {
		this.country = data.country;
		this.display_name = data.display_name;
		this.email = data.email;
		this.explicit_content = data.explicit_content;
		this.external_urls = data.external_urls;
		this.followers = data.followers;
		this.href = data.href;
		this.id = data.id;
		this.images = data.images;
		this.product = data.product;
		this.type = data.type;
		this.uri = data.uri;
	}
}
