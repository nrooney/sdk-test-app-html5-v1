
var discoveryServiceUri = "https://discover.mobileconnect.io/gsma/v2/discovery";
var discoveryClientID = "gZJ8mEnjoLiAgrfudHCEZvufOoafvf1S";
var discoveryClientSecret = "oESO7jLriPaF3qKA";
var redirect_uri = 'http://mc.mobilesites.net/authorised.html';

var apiClientID = null;
var apiClientSecret = null;
var operatorIdentified = false;
var operatorName = null;
var mcc = null;
var mnc = null;
var subscriberId = null;
var authorizationEndpoint = null;

/* 
 * Display server configurations 
 */
function atStartup() {
    $('#discoveryUrl').html(discoveryServiceUri);
    $('#clientId').html(discoveryClientID);
    $('#clientSecret').html(discoveryClientSecret);
    $('#redirecturi').html(redirect_uri);
}

/* 
 * Start login, first assess whether we need to run discovery or can go straight to authorisation
 */
function startLogin() {
    console.log("\n*********************************\nFUNCTION: startLogin()\n*********************************");
    console.log('Q. Logging in now, do we need to run discovery or go straight to authorisation?');
    
    if (authorizationEndpoint) {
        console.log('A. Go straight to authorization');
        runAuthorization();
    } else {
        console.log('A. Need active discovery');
        startActiveDiscovery();
    }
    
}

/* 
 * Start discovery
 */
function startActiveDiscovery() {
    console.log("*********************************\nIN FUNCTION startActiveDiscovery()\n*********************************");
    
    var encrypt = "basic";
    var sourceIP = null;
    var msisdn = null;
    var redirectUri = "http://mc.mobilesites.net/authorised.html";

    getDiscoveryActive(discoveryServiceUri, discoveryClientID, discoveryClientSecret, encrypt,
                   mcc, mnc, msisdn, sourceIP, redirectUri, activeDiscoveryComplete);
}

/* 
 * todo. 
 */
function discoveryRedirectCompleted(url) {
    console.log("\n*********************************\nFUNCTION: discoveryRedirectCompleted\n*********************************");
    if (!!window.postMessage && window.postMessage(url, '*')) {
        return true;
    }
}

/* 
 * Callback function for when Discovery completes  
 */
function activeDiscoveryComplete(discoveryResult, status) {
    console.log("\n*********************************\nFUNCTION: activeDiscoveryComplete()\n*********************************");
    console.log("HTTP Status Code: "+ status);
    console.log("Location: " + window.location.href);
    console.log("Callback for " + JSON.stringify(discoveryResult, null, 4));

    if (status==200) {
        if (discoveryResult && !!discoveryResult.getTtl()) { 
            console.log("TTL "+discoveryResult.getTtl()); 
        }
        if (discoveryResult && !!discoveryResult.getResponse()) {
            console.log("DiscoveryResponse " + JSON.stringify(discoveryResult.getResponse(), null, 4));
            processDiscoveryResult(discoveryResult);
            $('#discoveryStatus').val('Discovered in active mode');
        }
    }
}

/* 
 * Set authorisation parameters and attempt authorisation 
 */
function runAuthorization() {
    console.log("\n*********************************\nFUNCTION: runAuthorization()\n*********************************");
    prompt = 'login';
    max_age = 3600;
    acr_values = '2';
    login_hint = null;
    
    if (!!subscriberId) {
        login_hint = "ENCR_MSISDN:" + subscriberId;
        console.log("login_hint=" + login_hint);
    }

    authorizationOptions = new AuthorizationOptions('page', 'en', 'en', 'Enter MSISDN', login_hint, null); 
    state='State'+Math.random().toString(36);
    nonce='Nonce'+Math.random().toString(36);

    console.log("Login hint set to " + authorizationOptions['login_hint']);
    authorize(authorizationEndpoint, apiClientID, 'openid profile email', redirect_uri, 'code', state, nonce,
              prompt, max_age, acr_values, authorizationOptions, authorizationCallbackFunction);
}

/* 
 * Callback for when authorisation completes, get token
 */
function authorizationCallbackFunction(data) {
    console.log("\n*********************************\nFUNCTION: authorizationCallbackFunction()\n*********************************");
    console.log('Authorization Complete!');
    console.log(JSON.stringify(data, null, 4));

    code = data['code'];
    state = data['state'];
    error = data['error'];

    discoveryDetails = getCacheDiscoveryItem();
    tokenEndpoint = discoveryDetails.getResponse().getApiFunction('operatorid', 'token');
    apiClientID = discoveryDetails.getResponse().getClient_id();
    apiClientSecret = discoveryDetails.getResponse().getClient_secret();

    if (code && code!=null && (code.trim().length)>0) {
        $('#status').val('Authorized');
        $('#code').val(code);

        tokenFromAuthorizationCode(tokenEndpoint, code, apiClientID, apiClientSecret, redirect_uri,
                                       tokenReceived);

    } else {
        $('#status').val('Error');
    }
}

/* 
 * Callback function for when when token receieved, display on screeb and attempt to get user info
 */
function tokenReceived(token) {
    console.log("\n*********************************\nFUNCTION: tokenReceived\n*********************************");
    console.log(JSON.stringify(token, null, 4));

    if (!!token.refresh_token) $('#refresh_token').val(token.refresh_token);
    if (!!token.expires_in) $('#expires_in').val(token.expires_in);
    if (!!token.token_type) $('#token_type').val(token.token_type);

    if (!!token.access_token) {
        $('#access_token').val(token.access_token);
        discoveryDetails=getCacheDiscoveryItem();
        userinfoEndpoint=discoveryDetails.getResponse().getApiFunction('operatorid', 'userinfo');
        $('#status').val('Authorized + access token retrieved');
        
        if (userinfoEndpoint && userinfoEndpoint.trim().length>0) {
            userinfo(userinfoEndpoint, token.access_token, userinfoCallbackFunction);
        }
    }
}

/* 
 * Callback fundtion when user info received,  
 */
function userinfoCallbackFunction(userinfo) {
    console.log("\n*********************************\nFUNCTION: userinfoCallbackFunction\n*********************************");
    console.log(JSON.stringify(userinfo, null, 4));

    if (!!userinfo.email) $('#email').val(userinfo.email);
    if (!!userinfo.sub) $('#pcr').val(userinfo.sub);
    if (userinfo && userinfo.email_verified!==null) $('#email_verified').val(userinfo.email_verified?'true':'false');
}

/* 
 * Parse responses, assign to variables,  
 */
function processDiscoveryResult(discoveryResult) {
    console.log("\n*********************************\nFUNCTION: processDiscoveryResult()\n*********************************");

    operatorIdentified = true;
    operatorName = discoveryResult.getResponse().getServing_operator();
    apiClientID = discoveryResult.getResponse().getClient_id();
    apiClientSecret = discoveryResult.getResponse().getClient_secret();
    subscriberId = discoveryResult.getResponse().getSubscriber_id();
    $('#operatorName').val(operatorName);
    var endpoints = discoveryResult.getResponse().getApi('operatorid');
    
    console.log("apiClientID: " + JSON.stringify(apiClientID, null, 4));
    console.log("apiClientSecret: " + JSON.stringify(apiClientSecret, null, 4));
    console.log("subscriberId: " + JSON.stringify(subscriberId, null, 4));
    console.log("endpoint data: " + JSON.stringify(endpoints, null, 4));
    
    authorizationEndpoint = discoveryResult.getResponse().getApiFunction('operatorid', 'authorization');
    console.log("authorization endpoint " + authorizationEndpoint);
    
    if (authorizationEndpoint && authorizationEndpoint!=null) {
        operatorIdentified = true;
    }

    runAuthorization(); //added for our demo to go straight to auth after discovery
}

