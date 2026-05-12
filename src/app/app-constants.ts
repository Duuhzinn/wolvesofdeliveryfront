export class AppConstants {

public static get baseServidor(): string {return "https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI"}

public static get baseLogin(): string {return this.baseServidor + "/login"}

public static get baseUserURL(): string {return this.baseServidor + "/v1/users"}

public static get allUser(): string {return this.baseUserURL + "/allUser"}
}
