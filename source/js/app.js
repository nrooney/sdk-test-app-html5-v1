
var discoveryServiceUri = "https://discover.mobileconnect.io/gsma/v2/discovery";
var discoveryClientID = "gZJ8mEnjoLiAgrfudHCEZvufOoafvf1S";
var discoveryClientSecret = "oESO7jLriPaF3qKA";
// var logoServiceUri = "https://sb1.exchange.gsma.com/v1/logo";
var redirect_uri = 'http://localhost:8000/authorised.html';
var redirect_uri = 'http://mc.mobilesites.net/authorised.html';

// var discoveryServiceUri=discoveryServiceUriDefault;
// var discoveryClientID=discoveryClientIDDefault;
// var discoveryClientSecret=discoveryClientSecretDefault;
// var logoServiceUri=logoServiceUriDefault;
// var redirect_uri=redirect_uriDefault;

var apiClientID = null;
var apiClientSecret = null;
var operatorIdentified = false;
var operatorName = null;
var mcc = null;
var mnc = null;
var subscriberId = null;
var authorizationEndpoint = null;

/* 
 * Initial setup at start
 */
function atStartup() {
    console.log("\n*********************************\nIN FUNCTION atStart()\n*********************************"+           
                        "\ndiscoveryServiceUri = "+discoveryServiceUri+
                        "\ndiscoveryClientID = "+discoveryClientID+
                        "\ndiscoveryClientSecret = "+discoveryClientSecret+
                        // "\nlogoServiceUri = "+logoServiceUri+
                        "\nredirect_uri = "+redirect_uri);

    // if (!!localStorage.getObject('discoveryServiceUri')) discoveryServiceUri=localStorage.getObject('discoveryServiceUri');
    // if (!!localStorage.getObject('discoveryClientID')) discoveryClientID=localStorage.getObject('discoveryClientID');
    // if (!!localStorage.getObject('discoveryClientSecret')) discoveryClientSecret=localStorage.getObject('discoveryClientSecret');
    // if (!!localStorage.getObject('logoServiceUri')) logoServiceUri=localStorage.getObject('logoServiceUri');
    // if (!!localStorage.getObject('redirect_uri')) redirect_uri=localStorage.getObject('redirect_uri');

    $('#discoveryUrl').html(discoveryServiceUri);
    $('#clientId').html(discoveryClientID);
    $('#clientSecret').html(discoveryClientSecret);
    // $('#logoUrl').html(logoServiceUri);
    $('#redirecturi').html(redirect_uri);
 
    // discoveryDetails=getCacheDiscoveryItem();
    // if (discoveryDetails) {
    //     if (discoveryDetails.getTtl()) { console.log("TTL "+discoveryDetails.getTtl()); }
    //     if (discoveryDetails.getResponse()) {
    //         console.log("DiscoveryResponse "+JSON.stringify(discoveryDetails.getResponse()));
    //         processDiscoveryResult(discoveryDetails);
    //         getLogos();
    //         $('#discoveryStatus').val('Using cached details');
    // }
    // }
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
 * Start login, first assess whether we need to run discovery or can go straight to authorisation
 */
function startActiveDiscovery() {
    console.log("*********************************\nIN FUNCTION startActiveDiscovery()\n*********************************");
    
    var encrypt = "basic";
    var sourceIP = null;
    var msisdn = null;
    // var redirectUri = "http://localhost:8000/discovered.html";
    var redirectUri = "http://mc.mobilesites.net/authorised.html";

    getDiscoveryActive(discoveryServiceUri, discoveryClientID, discoveryClientSecret, encrypt,
                   mcc, mnc, msisdn, sourceIP, redirectUri, activeDiscoveryComplete);
}


// function startPassiveDiscovery() {
//     console.log("\n*********************************\nFUNCTION: startPassiveDiscovery\n*********************************");
//     var encrypt="basic";
//     var sourceIP=null;
//     var msisdn=null;
//     var redirectUri="http://localhost:8000/discovered.html";

//     console.log("Starting discovery in passive mode "+location.href);
    
//     getDiscoveryPassive(discoveryServiceUri, discoveryClientID, discoveryClientSecret, encrypt,
//                         mcc, mnc, msisdn, sourceIP, redirectUri, passiveDiscoveryComplete);
// }

// function passiveDiscoveryComplete(discoveryResult,status) {
//     console.log("\n*********************************\nFUNCTION: passiveDiscoveryComplete\n*********************************");
//     console.log("HTTP Status Code is "+status);
//     console.log("Callback for "+JSON.stringify(discoveryResult));
//     if (status==200) {
//         if (discoveryResult.getTtl()) { console.log("TTL "+discoveryResult.getTtl()); }
//         if (discoveryResult.getResponse()) {
//             console.log("DiscoveryResponse "+JSON.stringify(discoveryResult.getResponse()));
//             processDiscoveryResult(discoveryResult);
//             $('#discoveryStatus').val('Discovered in passive mode');
//     }
//     }
    
//     //getLogos();
// }

// function getLogos() {
//     console.log("\nFUNCTION: getLogos");
//     var sourceIP=null;
//     var logosize="medium";
//     var colormode="normal";
//     var aspect="landscape";
    
//     console.log("Starting request for logos");
//     getLogo(logoServiceUri, mcc, mnc, sourceIP, 'operatorid', logosize, colormode, aspect, logoComplete);
// }

// function logoComplete(logoResult) {
//     console.log("\nFUNCTION: logoComplete");
//     console.log("Callback for "+JSON.stringify(logoResult));
//     if (logoResult && logoResult.logos && logoResult.logos.length>=1) {
//         var first=logoResult.logos[0];
//         var url=first.url;
//         if (url) {
//             $('#loginButton').html('<img src=\''+url+'\' alt=\'Login with Mobile Connect\'/>');
//         }
//     }
// }

/* 
 * Start 
 */
function discoveryRedirectCompleted(url) {
    console.log("\n*********************************\nFUNCTION: discoveryRedirectCompleted\n*********************************");
    if (!!window.postMessage && window.postMessage(url, '*')) {
        return true;
    }
}

/* 
 * Start 
 */
function activeDiscoveryComplete(discoveryResult, status) {
    console.log("\n*********************************\nFUNCTION: activeDiscoveryComplete\n*********************************");
    console.log("HTTP Status Code is "+status);
    console.log("Callback for " + JSON.stringify(discoveryResult, null, 4));
    console.log("Location = "+window.location.href);
    if (status==200) {
        if (discoveryResult && !!discoveryResult.getTtl()) { console.log("TTL "+discoveryResult.getTtl()); }
        if (discoveryResult && !!discoveryResult.getResponse()) {
            console.log("DiscoveryResponse "+JSON.stringify(discoveryResult.getResponse(), null, 4));
            processDiscoveryResult(discoveryResult);
            $('#discoveryStatus').val('Discovered in active mode');
        }
    }

    //getLogos();
}

/* 
 * Start 
 */
function startDemo() {
    console.log("\n*********************************\nFUNCTION: startDemo()\n*********************************");
    parseMccMnc();
    startActiveDiscovery();
}

function parseMccMnc() {
    console.log("\n*********************************\nFUNCTION: parseMccMnc()\n*********************************");
    var mccmnc = $('#preselectedOperator').val();
    if (mccmnc == "_") {
        this.mcc = null;
        this.mnc = null;
    } else {
        var sv = mccmnc.split("_",2);
        if (sv.length == 2) {
            this.mcc = sv[0];
            this.mnc = sv[1];
        }
    }
}

/* 
 * Start 
 */
function runAuthorization() {
    console.log("\n*********************************\nFUNCTION: runAuthorization\n*********************************");
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
 * Start 
 */
function authorizationCallbackFunction(data) {
    console.log("\n*********************************\nFUNCTION: authorizationCallbackFunction\n*********************************");
    console.log('authorization complete');
    console.log("response=" + JSON.stringify(data, null, 4));

    code = data['code'];
    state = data['state'];
    error = data['error'];

    discoveryDetails=getCacheDiscoveryItem();
    tokenEndpoint=discoveryDetails.getResponse().getApiFunction('operatorid', 'token');
    apiClientID=discoveryDetails.getResponse().getClient_id();
    apiClientSecret=discoveryDetails.getResponse().getClient_secret();

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
 * Start 
 */
function tokenReceived(token) {
    console.log("\n*********************************\nFUNCTION: tokenReceived\n*********************************");
    console.log("token response="+JSON.stringify(token, null, 4));
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
 * Start 
 */
function userinfoCallbackFunction(userinfo) {
    console.log("\n*********************************\nFUNCTION: userinfoCallbackFunction\n*********************************");
    console.log("userinfo response="+JSON.stringify(userinfo, null, 4));
    if (!!userinfo.email) $('#email').val(userinfo.email);
    if (userinfo && userinfo.email_verified!==null) $('#email_verified').val(userinfo.email_verified?'true':'false');
}

/* 
 * Start 
 */
function processDiscoveryResult(discoveryResult) {
    console.log("\n*********************************\nFUNCTION: processDiscoveryResult\n*********************************");
    // console.log("IN FUNCTION processDiscoveryResult()"+           
    //                     "\ndiscoveryServiceUri = "+discoveryServiceUri+
    //                     "\ndiscoveryClientID = "+discoveryClientID+
    //                     "\ndiscoveryClientSecret = "+discoveryClientSecret+
    //                     "\nlogoServiceUri = "+logoServiceUri+
    //                     "\nredirect_uri = "+redirect_uri);

    operatorIdentified=true;
    operatorName=discoveryResult.getResponse().getServing_operator();
    apiClientID=discoveryResult.getResponse().getClient_id();
    apiClientSecret=discoveryResult.getResponse().getClient_secret();
    subscriberId=discoveryResult.getResponse().getSubscriber_id();
    $('#operatorName').val(operatorName);
    var endpoints=discoveryResult.getResponse().getApi('operatorid');
    
    console.log("apiClientID "+JSON.stringify(apiClientID, null, 4));
    console.log("apiClientSecret "+JSON.stringify(apiClientSecret, null, 4));
    console.log("subscriberId "+JSON.stringify(subscriberId, null, 4));
    console.log("endpoint data "+JSON.stringify(endpoints, null, 4));
    
    authorizationEndpoint=discoveryResult.getResponse().getApiFunction('operatorid', 'authorization');
    console.log("authorization endpoint "+authorizationEndpoint);
    if (authorizationEndpoint && authorizationEndpoint!=null) {
        operatorIdentified=true;
    }
}

// /* 
//  * Start 
//  */
// function restoreConfigDefaults() {
//     console.log("\n*********************************\nFUNCTION: restoreConfigDefaults\n*********************************");
//     // discoveryServiceUri=discoveryServiceUriDefault;
//     // discoveryClientID=discoveryClientIDDefault;
//     // discoveryClientSecret=discoveryClientSecretDefault;
//     // logoServiceUri=logoServiceUriDefault;
//     // redirect_uri=redirect_uriDefault;
//     $('#discoveryUrl').val(discoveryServiceUri);
//     $('#clientId').val(discoveryClientID);
//     $('#clientSecret').val(discoveryClientSecret);
//     $('#logoUrl').val(logoServiceUri);
//     $('#redirecturi').val(redirect_uri);
//     storeConfiguration();
// }

/* 
 * Start 
 */
function clearDiscoveryCache() {
    console.log("\n*********************************\nFUNCTION: clearDiscoveryCache\n*********************************");
    clearCacheDiscoveryItem();
    apiClientID=null;
    apiClientSecret=null;
    
    operatorIdentified=false;
    operatorName=null;
    mcc=null;
    mnc=null;
    
    $('#discoveryStatus').val('Not discovered');
    $('#operatorName').val('Not known');
}

// /* 
//  * Start 
//  */
// function storeConfiguration() {
//     console.log("\n*********************************\nFUNCTION: storeConfiguration\n*********************************");
//     discoveryServiceUri=$('#discoveryUrl').val();
//     discoveryClientID=$('#clientId').val();
//     discoveryClientSecret=$('#clientSecret').val();
//     logoServiceUri=$('#logoUrl').val();
//     redirect_uri=$('#redirecturi').val();

//     localStorage.setObject('discoveryServiceUri',$('#discoveryUrl').val());
//     localStorage.setObject('discoveryClientID',$('#clientId').val());
//     localStorage.setObject('discoveryClientSecret',$('#clientSecret').val());
//     localStorage.setObject('logoServiceUri',$('#logoUrl').val());
//     localStorage.setObject('redirect_uri',$('#redirecturi').val());
// }
