export class AppConstants {

public static get baseServidor(): string {return "https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI"}

//ROTA PARA LOGAR NO SISTEMA
public static get baseLogin(): string {return this.baseServidor + "/login"}

//BASE PARA MONTAR REQUISIÇÕES DE USUARIOS
public static get baseUserURL(): string {return this.baseServidor + "/v1/users"}
//REQUISIÇÕES DO USUARIO
public static get allUser(): string {return this.baseUserURL + "/allUser"}
public static pesqUserNome(nome: String): string {return this.baseUserURL + "/pesqName/" + nome}
public static salvarUsuario(): string {return this.baseUserURL + "/createUser"}
public static atualizarUsuario(): string {return this.baseUserURL + "/updateUser" }
public static usuarioLogado(): string {return this.baseUserURL + "/userLogado"}

//BASE PARA MONTAR REQUISIÇÕES DE MOTORISTAS
public static get baseDriveURL(): string {return this.baseServidor + "/v1/drive"}
public static get allDrive(): string {return this.baseDriveURL+ "/allDrive"}

public static teste(): string { alert("entrou no AppConstants!"); return this.baseUserURL + "/createUser";}
}
