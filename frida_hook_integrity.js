/**
 * Frida Script to Hook WhatsApp Play Integrity Token Generation
 * Usage: frida -U -f com.whatsapp -l frida_hook_integrity.js
 */

console.log("[*] WhatsApp Play Integrity Hook Started");

Java.perform(function() {
    console.log("[*] Java runtime attached");
    
    // Hook StandardIntegrityManager - prepareIntegrityToken
    try {
        var StandardIntegrityManager = Java.use("com.google.android.play.core.integrity.StandardIntegrityManager");
        console.log("[+] Found StandardIntegrityManager");
        
        StandardIntegrityManager.prepareIntegrityToken.overload('com.google.android.play.core.integrity.StandardIntegrityManager$PrepareIntegrityTokenRequest').implementation = function(request) {
            console.log("\n[!] prepareIntegrityToken() called");
            
            // Try to extract cloud project number
            try {
                var requestClass = Java.use("com.google.android.play.core.integrity.StandardIntegrityManager$PrepareIntegrityTokenRequest");
                console.log("[+] Request object: " + request);
                
                // Try reflection to get cloud project number
                var clazz = request.getClass();
                var methods = clazz.getDeclaredMethods();
                for (var i = 0; i < methods.length; i++) {
                    var methodName = methods[i].getName();
                    if (methodName.indexOf("CloudProjectNumber") >= 0 || methodName.indexOf("cloudProjectNumber") >= 0) {
                        console.log("[+] Found method: " + methodName);
                        try {
                            methods[i].setAccessible(true);
                            var value = methods[i].invoke(request, null);
                            console.log("[!] Cloud Project Number: " + value);
                        } catch (e) {}
                    }
                }
            } catch (e) {
                console.log("[-] Error extracting request details: " + e);
            }
            
            var result = this.prepareIntegrityToken(request);
            console.log("[+] prepareIntegrityToken returned: " + result);
            return result;
        };
    } catch (e) {
        console.log("[-] StandardIntegrityManager not found: " + e);
    }
    
    // Hook StandardIntegrityTokenProvider - request
    try {
        var TokenProvider = Java.use("com.google.android.play.core.integrity.StandardIntegrityManager$StandardIntegrityTokenProvider");
        console.log("[+] Found StandardIntegrityTokenProvider");
        
        TokenProvider.request.implementation = function(tokenRequest) {
            console.log("\n[!] TokenProvider.request() called");
            console.log("[+] Request: " + tokenRequest);
            
            var result = this.request(tokenRequest);
            console.log("[+] Token request task created");
            return result;
        };
    } catch (e) {
        console.log("[-] TokenProvider not found: " + e);
    }
    
    // Hook WhatsApp's KPN class (integrity token wrapper)
    try {
        var KPN = Java.use("X.KPN");
        console.log("[+] Found X.KPN (WhatsApp integrity wrapper)");
        
        // Hook A00 - token request method
        KPN.A00.implementation = function(kpn, str, continuation) {
            console.log("\n[!] KPN.A00() called - Token Request");
            console.log("[+] Request String: " + str);
            console.log("[+] KPN object: " + kpn);
            
            // Try to read A00 field (cloud project number)
            try {
                var cloudNum = kpn.A00.value;
                console.log("[!] CLOUD PROJECT NUMBER: " + cloudNum);
            } catch (e) {
                console.log("[-] Could not read A00: " + e);
            }
            
            var result = this.A00(kpn, str, continuation);
            console.log("[+] Token will be returned via continuation");
            return result;
        };
        
        // Hook A01 - prepare token method
        KPN.A01.implementation = function(kpn, continuation) {
            console.log("\n[!] KPN.A01() called - Prepare Token");
            
            // Try to read cloud project number
            try {
                var cloudNum = kpn.A00.value;
                console.log("[!] CLOUD PROJECT NUMBER: " + cloudNum);
            } catch (e) {
                console.log("[-] Could not read A00: " + e);
            }
            
            var result = this.A01(kpn, continuation);
            return result;
        };
    } catch (e) {
        console.log("[-] X.KPN not found: " + e);
    }
    
    // Hook registration bridge
    try {
        var RegBridge = Java.use("com.whatsapp.registration.core.http.KotlinRegistrationBridge");
        console.log("[+] Found KotlinRegistrationBridge");
        
        // Hook all methods that contain "code" or "register" in their name
        var methods = RegBridge.class.getDeclaredMethods();
        for (var i = 0; i < methods.length; i++) {
            var methodName = methods[i].getName();
            if (methodName.indexOf("code") >= 0 || methodName.indexOf("Code") >= 0 ||
                methodName.indexOf("register") >= 0 || methodName.indexOf("Register") >= 0) {
                console.log("[+] Found registration method: " + methodName);
            }
        }
    } catch (e) {
        console.log("[-] KotlinRegistrationBridge not found: " + e);
    }
    
    console.log("\n[*] All hooks installed. Waiting for registration activity...\n");
});
