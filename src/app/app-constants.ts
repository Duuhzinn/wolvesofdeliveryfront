export class AppConstants {

public static get baseServidor(): string {return "https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI"}

//ROTA PARA LOGAR NO SISTEMA
public static get baseLogin(): string {return this.baseServidor + "/login"}

//BASE PARA MONTAR REQUISIÇÕES DE USUARIOS
public static get baseUserURL(): string {return this.baseServidor + "/v1/users"}
public static get allUser(): string {return this.baseUserURL + "/allUser"}
public static pesqUserNome(nome: String, tipoUser: string): string {
  return this.baseUserURL + "/pesqName/" + nome + "?tipoUser=" + tipoUser;
}
public static salvarUsuario(): string {return this.baseUserURL + "/createUser"}
public static atualizarUsuario(): string {return this.baseUserURL + "/updateUser" }
public static usuarioLogado(): string {return this.baseUserURL + "/userLogado"}

//BASE PARA MONTAR REQUISIÇÕES DE MOTORISTAS
public static get baseDriveURL(): string {return this.baseServidor + "/v1/drive"}
public static get allDrive(): string {return this.baseDriveURL + "/allDrive"}
public static changeStatus(id: any): string { return this.baseDriveURL + "/changeStatus/" + id }
public static get driverQueue(): string {return this.baseDriveURL + "/driverQueue"}
public static get firstDrive(): string {return this.baseDriveURL + "/driverQueue/firstid"}
public static callingDrive(id: number): string {return this.baseDriveURL + "/callingDrive/" + id }
public static busy(id: any): string { return this.baseDriveURL + "/busy/" + id}
public static signoffline(id: number): string {return this.baseDriveURL + "/signOffline/" + id}


//BASE PARA MONTAR A REQUISIÇÕES DO PUSH NOTIFICATION
public static get basePushNotification(): string {return this.baseServidor + "/v1/pushnotification"}
public static sendDrive(motoristaID: number): string {
    return this.basePushNotification + "/send/" + motoristaID}
public static lostRace(motoristaID: number, corridaID: number): string {
  return this.basePushNotification + "/lostRace/" + motoristaID + "/" + corridaID;
}
public static acceptRace(corridaId: number, motoristaId: number): string{
    return this.basePushNotification + "/acceptRace/" + corridaId + "/" + motoristaId
}


//BASE PARA MONTAR AS REQUISIÇÕES DA CORRIDA
public static get baseRaceURL(): string {return this.baseServidor + "/v1/corrida"}
public static createRace(despachante: number): string {
    return this.baseRaceURL + "/createRace/" + despachante
};
public static raceDespatcher(clienteId: number): string{
    return this.baseRaceURL + "/raceDespatcher/" + clienteId
}
public static raceDrive(motoristaId: number): string{
    return this.baseRaceURL + "/raceDrive/" + motoristaId
}
public static allRace(): string {return this.baseRaceURL + "/allRace"}
public static updateRace(corridaId: number): string{
    return this. baseRaceURL + "/updateRace/" + corridaId
}




public static teste(): string { alert("entrou no AppConstants!"); return this.baseUserURL + "/createUser";}
}
