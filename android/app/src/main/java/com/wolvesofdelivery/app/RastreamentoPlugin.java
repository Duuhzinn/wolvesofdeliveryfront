package com.wolvesofdelivery.app;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Rastreamento")
public class RastreamentoPlugin extends Plugin {

  @PluginMethod
  public void iniciar(PluginCall call) {
    String motoristaId = call.getString("motoristaId");
    String motoristaNome = call.getString("motoristaNome");
    String corridaId = call.getString("corridaId");
    String token = call.getString("token");

    Intent intent = new Intent(getContext(), LocalizacaoService.class);
    intent.putExtra("motoristaId", motoristaId);
    intent.putExtra("motoristaNome", motoristaNome);
    intent.putExtra("corridaId", corridaId);
    intent.putExtra("token", token);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      getContext().startForegroundService(intent);
    } else {
      getContext().startService(intent);
    }

    call.resolve();
  }

  @PluginMethod
  public void parar(PluginCall call) {
    Intent intent = new Intent(getContext(), LocalizacaoService.class);
    getContext().stopService(intent);
    call.resolve();
  }
}
