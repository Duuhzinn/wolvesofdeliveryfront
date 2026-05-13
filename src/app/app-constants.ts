export class AppConstants {

public static get baseServidor(): string {return "https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI"}

public static get baseLogin(): string {return this.baseServidor + "/login"}

//BASE PARA MONTAR REQUISIÇÕES DE USUARIOS
public static get baseUserURL(): string {return this.baseServidor + "/v1/users"}
public static get allUser(): string {return this.baseUserURL + "/allUser"}

//BASE PARA MONTAR REQUISIÇÕES DE MOTORISTAS
public static get baseDriveURL(): string {return this.baseServidor + "/v1/drive"}
public static get allDrive(): string {return this.baseDriveURL+ "/allDrive"}
}
