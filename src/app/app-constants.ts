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
public static recusarCorrida(motoristaId: number, corridaId: number, despachanteId: number): string {
  return this.baseDriveURL + "/recusarCorrida/" + motoristaId + "/" + corridaId + "/" + despachanteId
}
public static statusUsuario(id: number, status: number): string {
  return this.baseUserURL + "/status/" + id + "/" + status
}

//BASE PARA MONTAR A REQUISIÇÕES DO PUSH NOTIFICATION
public static get basePushNotification(): string {return this.baseServidor + "/v1/pushnotification"}
public static sendDrive(motoristaID: number, despachanteId: number): string {
  return this.basePushNotification + "/send/" + motoristaID + "/" + despachanteId
}
public static lostRace(motoristaID: number, corridaID: number): string {
  return this.basePushNotification + "/lostRace/" + motoristaID + "/" + corridaID
}
public static acceptRace(corridaId: number): string {
  return this.basePushNotification + "/acceptRace/" + corridaId
}


//BASE PARA MONTAR AS REQUISIÇÕES DA CORRIDA
public static get baseRaceURL(): string {return this.baseServidor + "/v1/corrida"}
public static raceDespatcherInProgress(clienteId: number): string{
  return this.baseRaceURL + "/raceDespatcher/" + clienteId
}
public static raceDespatcherFinished(clienteId: number): string{
  return this.baseRaceURL + "/raceDespatcherFinished/" + clienteId;
}
public static raceDriveInProgress(motoristaId: number): string{
  return this.baseRaceURL + "/raceDrive/" + motoristaId
}
public static raceDriveFinished(motoristaId: number): string{
  return this.baseRaceURL + "/raceDriveFinished/" + motoristaId
}
public static allRaceInProgress(): string {return this.baseRaceURL + "/allRace"}
public static allRaceFinished(): string {return this.baseRaceURL + "/allRaceFinished"};
public static updateRace(corridaId: number): string{return this.baseRaceURL + "/updateRace/" + corridaId}
public static cancelCall(motoristaAtual: number): string {return this.baseRaceURL + "/cancelCall/" + motoristaAtual}
public static expireRace(corridaId: number): string{return this.baseRaceURL + "/expireRace/" + corridaId}


//ESTATÍSTICAS POR ANO
public static estatisticasCliente(clienteId: number, ano: number): string {
  return this.baseRaceURL + "/estatisticas/cliente/" + clienteId + "/" + ano;
}
public static estatisticasMotorista(motoristaId: number, ano: number): string {
  return this.baseRaceURL + "/estatisticas/motorista/" + motoristaId + "/" + ano;
}
public static estatisticasAdm(ano: number): string {
  return this.baseRaceURL + "/estatisticas/adm/" + ano;
}

//DASHBOAR ADMIN CLIENTE E MOTORISTA
public static get baseDashBoardURL(): string {return this.baseServidor + "/v1/dashboard"}
public static dashBoardAdmin(usuarioId: number): string{
  return this.baseDashBoardURL + "/admin/" + usuarioId
}




public static teste(): string { alert("entrou no AppConstants!"); return this.baseUserURL + "/createUser";}
}
