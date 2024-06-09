import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	async login(@Body() authInfo: any) {
		const users = await this.authService.listUsers(authInfo.userSub);
		console.log(users);
		console.log(users.Users);
		if (!users) {
			return { message: "Invalid credentials" };
		}
		if (!users.Users || users.Users.length === 0) {
			return { message: "Invalid credentials" };
		}

		console.log(users.Users[0]);
		console.log(users.Users[0].Attributes);

		//match the email address given with the email in the UserPool
		
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
