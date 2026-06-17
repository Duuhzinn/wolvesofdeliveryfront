package com.wolvesofdelivery.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.location.Location;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LocalizacaoService extends Service {

  private static final String CHANNEL_ID = "rastreamento_channel";
  private FusedLocationProviderClient fusedLocationClient;
  private LocationCallback locationCallback;
  private ExecutorService executor = Executors.newSingleThreadExecutor();
  private HandlerThread handlerThread; // ✅ ADICIONADO

  private String motoristaId;
  private String motoristaNome;
  private String corridaId;
  private String token;

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    motoristaId = intent.getStringExtra("motoristaId");
    motoristaNome = intent.getStringExtra("motoristaNome");
    corridaId = intent.getStringExtra("corridaId");
    token = intent.getStringExtra("token");

    criarCanalNotificacao();
    Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("🐺 Wolves of Delivery")
      .setContentText("Rastreamento ativo")
      .setSmallIcon(android.R.drawable.ic_menu_mylocation)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build();

    startForeground(1, notification);
    iniciarRastreamento();
    return START_STICKY;
  }

  private void iniciarRastreamento() {
    fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

    handlerThread = new HandlerThread("LocationThread");
    handlerThread.start();
    Handler locationHandler = new Handler(handlerThread.getLooper());

    LocationRequest locationRequest = new LocationRequest.Builder(3000)
      .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
      .setMinUpdateIntervalMillis(1000)
      .build();

    locationCallback = new LocationCallback() {
      @Override
      public void onLocationResult(LocationResult locationResult) {
        if (locationResult == null) return;
        for (Location location : locationResult.getLocations()) {
          android.util.Log.d("WolvesGPS", "Lat=" + location.getLatitude() +
            " Lng=" + location.getLongitude() +
            " Accuracy=" + location.getAccuracy() +
            " Age=" + (System.currentTimeMillis() - location.getTime()) + "ms");
          long idadeMs = System.currentTimeMillis() - location.getTime();
          if (idadeMs > 5000) continue;
          enviarLocalizacao(location.getLatitude(), location.getLongitude());
        }
      }
    };

    try {
      fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, locationHandler.getLooper());
    } catch (SecurityException e) {
      e.printStackTrace();
    }
  }

  private void enviarLocalizacao(double lat, double lng) {
    if (executor.isShutdown()) return;
    executor.execute(() -> {
      try {
        URL url = new URL("https://wolvesofdeliveryapi.onrender.com/wolvesofdeliveryAPI/v1/localizacao");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);

        JSONObject payload = new JSONObject();
        payload.put("motoristaId", motoristaId);
        payload.put("motoristaNome", motoristaNome);
        payload.put("corridaId", corridaId);
        payload.put("lat", lat);
        payload.put("lng", lng);

        OutputStream os = conn.getOutputStream();
        os.write(payload.toString().getBytes());
        os.flush();
        conn.getResponseCode();
        conn.disconnect();
      } catch (Exception e) {
        e.printStackTrace();
      }
    });
  }

  private void criarCanalNotificacao() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "Rastreamento",
        NotificationManager.IMPORTANCE_LOW
      );
      channel.setDescription("Rastreamento de corrida ativa");
      NotificationManager manager = getSystemService(NotificationManager.class);
      manager.createNotificationChannel(channel);
    }
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    if (fusedLocationClient != null && locationCallback != null) {
      fusedLocationClient.removeLocationUpdates(locationCallback);
    }
    if (handlerThread != null) {
      handlerThread.quitSafely();
    }
    executor.shutdown();
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }
}
