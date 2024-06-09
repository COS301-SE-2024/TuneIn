import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

/*
{
  "CodeDeliveryDetails": {
    "AttributeName": "email",
    "DeliveryMedium": "EMAIL",
    "Destination": "t***@g***"
  },
  "UserConfirmed": false,
  "UserSub": "311ce2e8-8041-70bd-0ab5-be97283ee182"
}
*/
interface AWSCognitioAuthResponse {
	CodeDeliveryDetails: {
		AttributeName: string;
		DeliveryMedium: string;
		Destination: string;
	};
	UserConfirmed: boolean;
	UserSub: string;
}

interface AuthBody {
	username: string;
	email: string;
	AWSResponse: AWSCognitioAuthResponse;
}

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	async login(@Body() authInfo: AuthBody) {
		const users = await this.authService.listUsers();
		console.log(users);
		console.log(users.Users);
		if (!users) {
			return { message: "Invalid credentials. No users on Cognito" };
		}
		if (!users.Users || users.Users.length === 0) {
			return { message: "Invalid credentials. No users on Cognito" };
		}

		console.log(users.Users[0]);
		console.log(users.Users[0].Attributes);

		const a  = users.Users;
		const b = a[0];
		const c = b.Username;
		const d = b.Attributes;
		console.log("A",a);
		console.log("B",b);
		console.log("C",c);
		console.log("D",d);
		if (d && d !== undefined && d.length > 0){
			const e = d.find(
				(attribute) => attribute.Name === "email"
			).Value;
		}

		//match the email address given with the email in the UserPool
		const userMatch = null;
		for (let i = 0; i < users.Users.length; i++) {
			if (
				users.Users[i].Attributes.find(
					(attribute) => attribute.Name === "email"
				).Value === authInfo.email
			) {
				userMatch = users.Users[i];
				break;
			}
		}
		
		//const userCognitioID = user.Users[0].Attributes.find(
		const userEmail = users.Users[0].Attributes.find(
			(attribute) => attribute.Name === "email"
		).Value;

		const payload = {
			sub: users.Users[0].Username,
			username: users.Users[0].Attributes.find(
				(attribute) => attribute.Name === "email"
			).Value,
		};
		}
		return { message: "Login successful" };
	}
}
