package com.pocketmma.juego;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

/**
 * Pocket MMA para Android: el juego (HTML/JS en assets/www) corre dentro de un WebView a pantalla completa,
 * siempre acostado. Los archivos se sirven desde https://appassets.androidplatform.net/assets/www/
 * para que el navegador los trate como un sitio normal (guardado, colores de los peleadores, etc.).
 */
public class MainActivity extends Activity {
    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(0xFF000000);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // guardado de la carrera y los peleadores creados
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setTextZoom(100);                     // que el tamaño de letra del celular no rompa el diseño

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                return loader.shouldInterceptRequest(req.getUrl());
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                // los links de afuera (por ejemplo el de Supabase del email) se abren en el navegador
                if (!"appassets.androidplatform.net".equals(u.getHost())) {
                    try { startActivity(new android.content.Intent(android.content.Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
                    return true;
                }
                return false;
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("https://appassets.androidplatform.net/assets/www/index.html");
        pantallaCompleta();
    }

    // Esconde la barra de estado y los botones de navegación (vuelven deslizando desde el borde)
    private void pantallaCompleta() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) pantallaCompleta();
    }

    // Botón "atrás": en una pelea pone pausa; en los menús vuelve al menú principal; en el menú principal sale
    @Override
    public void onBackPressed() {
        web.evaluateJavascript(
            "(function(){try{if(typeof G!=='undefined'&&G&&curScreen==='fight'){if(!G.paused)pause(true);return 'ok';}" +
            "if(!document.getElementById('ov').hidden){hideOv();return 'ok';}" +
            "if(curScreen!=='home'){showScreen('home');return 'ok';}}catch(e){}return 'salir';})()",
            r -> { if (r != null && r.contains("salir")) MainActivity.super.onBackPressed(); });
    }

    @Override protected void onPause() { super.onPause(); web.onPause();
        web.evaluateJavascript("try{if(G&&curScreen==='fight'&&!G.paused)pause(true)}catch(e){}", null); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }
}
