export class AppConstants {

public static get baseServidor(): string {return "https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI"}

//ROTA PARA LOGAR NO SISTEMA
public static get baseLogin(): string {return this.baseServidor + "/login"}



//BASE PARA MONTAR REQUISIÇÕES DE USUARIOS
public static get baseUserURL(): string {return this.baseServidor + "/v1/users"}
public static get allUser(): string {return this.baseUserURL + "/allUser"}
public static pesqUserNome(nome: String): string {return this.baseUserURL + "/pesqName/" + nome}
public static salvarUsuario(): string {return this.baseUserURL + "/createUser"}
public static atualizarUsuario(): string {return this.baseUserURL + "/updateUser" }
public static usuarioLogado(): string {return this.baseUserURL + "/userLogado"}

//BASE PARA MONTAR REQUISIÇÕES DE MOTORISTAS
public static get baseDriveURL(): string {return this.baseServidor + "/v1/drive"}
public static get allDrive(): string {return this.baseDriveURL + "/allDrive"}
public static changeStatus(id: any): string { return this.baseDriveURL + "/changeStatus/" + id }
public static get driverQueue(): string {return this.baseDriveURL + "/driverQueue"}
public static get firstDrive(): string {return this.baseDriveURL + "/driverQueue/firstid"}

//BASE PARA MONTAR A BASE DO PUSH NOTIFICATION
public static get basePushNotification(): string {return this.baseServidor + "/v1/pushnotification"}
public static sendDrive(usuarioId: number): string {
    return this.basePushNotification + "/enviar/" + usuarioId}


public static teste(): string { alert("entrou no AppConstants!"); return this.baseUserURL + "/createUser";}
}
