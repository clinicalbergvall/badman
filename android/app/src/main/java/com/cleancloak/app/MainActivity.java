package com.cleancloak.app;

import android.os.Bundle;
import android.view.WindowInsets;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WebView webView = this.getBridge().getWebView();
    if (webView != null) {
      WebSettings settings = webView.getSettings();
      settings.setMediaPlaybackRequiresUserGesture(false);

      CookieManager cookieManager = CookieManager.getInstance();
      cookieManager.setAcceptCookie(true);
      cookieManager.setAcceptThirdPartyCookies(webView, true);
    }
    
    // Enable edge-to-edge display
    getWindow().getDecorView().setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
      @Override
      public WindowInsets onApplyWindowInsets(View v, WindowInsets insets) {
        return insets.consumeSystemWindowInsets();
      }
    });
  }
}
