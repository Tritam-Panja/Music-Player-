package com.liquidmusic.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Optimize WebView for audio streaming & media playback
        try {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);

                // Strip '; wv' from User-Agent so YouTube iframe does not block playback with Error 150
                String ua = settings.getUserAgentString();
                if (ua != null && ua.contains("; wv")) {
                    settings.setUserAgentString(ua.replace("; wv", ""));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
