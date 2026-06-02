package com.wolvesofdelivery.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    criarCanalNotificacao();
  }

  private void criarCanalNotificacao() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationManager manager = getSystemService(NotificationManager.class);

      // CANAL DE NOVA CORRIDA - VIBRAÇÃO LONGA
      NotificationChannel canal = new NotificationChannel(
        "corrida_channel",
        "Corridas",
        NotificationManager.IMPORTANCE_HIGH
      );
      canal.setDescription("Notificações de novas corridas");
      canal.enableVibration(true);
      canal.setVibrationPattern(new long[]{
        0, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000,
        500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000,
        500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000,
        500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000,
        500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000,
        500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000,
        500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000,
        500, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000
      });
      manager.createNotificationChannel(canal);

      // CANAL GERAL - VIBRAÇÃO NORMAL
      NotificationChannel canalGeral = new NotificationChannel(
        "geral_channel",
        "Geral",
        NotificationManager.IMPORTANCE_DEFAULT
      );
      canalGeral.setDescription("Notificações gerais");
      manager.createNotificationChannel(canalGeral);
    }
  }
}
