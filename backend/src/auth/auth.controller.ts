import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	async login(@Body() authInfo: any) {
		const user = await this.authService.listUsers(authInfo.userSub);
		console.log(user);
		console.log(user.Users);
		if (!user) {
			return { message: "Invalid credentials" };
		}
		if (!user.Users || user.Users.length === 0) {
			return { message: "Invalid credentials" };
		}
		console.log(user.Users[0]);
		console.log(user.Users[0].Attributes);
		// Handle login logic, like generating JWT
		return { message: "Login successful" };
	}
}
