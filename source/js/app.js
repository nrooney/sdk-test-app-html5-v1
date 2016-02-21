
var discoveryServiceUriDefault="https://discovery.sandbox2.mobileconnect.io";
var discoveryClientIDDefault="gZJ8mEnjoLiAgrfudHCEZvufOoafvf1S";
var discoveryClientSecretDefault="oESO7jLriPaF3qKA";
var logoServiceUriDefault="https://sb1.exchange.gsma.com/v1/logo";
var redirect_uriDefault='http://localhost:8000/authorised.html';

var discoveryServiceUri=discoveryServiceUriDefault;
var discoveryClientID=discoveryClientIDDefault;
var discoveryClientSecret=discoveryClientSecretDefault;
var logoServiceUri=logoServiceUriDefault;
var redirect_uri=redirect_uriDefault;

var apiClientID=null;
var apiClientSecret=null;

var operatorIdentified=false;
var operatorName=null;
var mcc=null;
var mnc=null;
var subscriberId=null;

var authorizationEndpoint=null;

function startPassiveDiscovery() {
    console.log("\nFUNCTION: startPassiveDiscovery");
    var encrypt="basic";
    var sourceIP=null;
    var msisdn=null;
    var redirectUri="http://localhost:8000/discovered.html";

    if (console.log) console.log("Starting discovery in passive mode "+location.href);
    
    getDiscoveryPassive(discoveryServiceUri, discoveryClientID, discoveryClientSecret, encrypt,
                        mcc, mnc, msisdn, sourceIP, redirectUri, passiveDiscoveryComplete);
}

function passiveDiscoveryComplete(discoveryResult,status) {
    console.log("\nFUNCTION: passiveDiscoveryComplete");
    if (console.log) console.log("HTTP Status Code is "+status);
    if (console.log) console.log("Callback for "+JSON.stringify(discoveryResult));
    if (status==200) {
        if (discoveryResult.getTtl()) { console.log("TTL "+discoveryResult.getTtl()); }
        if (discoveryResult.getResponse()) {
            if (console.log) console.log("DiscoveryResponse "+JSON.stringify(discoveryResult.getResponse()));
            processDiscoveryResult(discoveryResult);
            $('#discoveryStatus').val('Discovered in passive mode');
    }
    }
    
    getLogos();
}

function getLogos() {
    console.log("\nFUNCTION: getLogos");
    var sourceIP=null;
    var logosize="medium";
    var colormode="normal";
    var aspect="landscape";
    
    if (console.log) console.log("Starting request for logos");
    getLogo(logoServiceUri, mcc, mnc, sourceIP, 'operatorid', logosize, colormode, aspect, logoComplete);
}

function logoComplete(logoResult) {
    console.log("\nFUNCTION: logoComplete");
    if (console.log) console.log("Callback for "+JSON.stringify(logoResult));
    if (logoResult && logoResult.logos && logoResult.logos.length>=1) {
        var first=logoResult.logos[0];
        var url=first.url;
        if (url) {
            $('#loginButton').html('<img src=\''+url+'\' alt=\'Login with Mobile Connect\'/>');
        }
    }
}

function startActiveDiscovery() {
    console.log("IN FUNCTION startActiveDiscovery()"+           
                        "\ndiscoveryServiceUri="+discoveryServiceUri+
                        "\ndiscoveryClientID="+discoveryClientID+
                        "\ndiscoveryClientSecret="+discoveryClientSecret+
                        "\nlogoServiceUri="+logoServiceUri+
                        "\nredirect_uri="+redirect_uri);
    
    var encrypt="basic";
    var sourceIP=null;
    var msisdn=null;
    var redirectUri="http://localhost:8000/discovered.html";

    if (console.log) console.log("Starting active discovery");

    getDiscoveryActive(discoveryServiceUri, discoveryClientID, discoveryClientSecret, encrypt,
                   mcc, mnc, msisdn, sourceIP, redirectUri, activeDiscoveryComplete);
}

function discoveryRedirectCompleted(url) {
    console.log("\nFUNCTION: discoveryRedirectCompleted");
    if (!!window.postMessage && window.postMessage(url, '*')) {
        return true;
    }
}

function activeDiscoveryComplete(discoveryResult, status) {
    console.log("\nFUNCTION: activeDiscoveryComplete");
    if (console.log) console.log("HTTP Status Code is "+status);
    if (console.log) console.log("Callback for "+JSON.stringify(discoveryResult));
    if (console.log) console.log("Location = "+window.location.href);
    if (status==200) {
        if (discoveryResult && !!discoveryResult.getTtl()) { console.log("TTL "+discoveryResult.getTtl()); }
        if (discoveryResult && !!discoveryResult.getResponse()) {
            if (console.log) console.log("DiscoveryResponse "+JSON.stringify(discoveryResult.getResponse()));
            processDiscoveryResult(discoveryResult);
            $('#discoveryStatus').val('Discovered in active mode');
        }
    }

    getLogos();
}

function startDemo() {
    console.log("\nFUNCTION: startDemo");
    parseMccMnc();
    startActiveDiscovery();
}

function parseMccMnc() {
    console.log("\nFUNCTION: parseMccMnc");
    var mccmnc=$('#preselectedOperator').val();
    if (mccmnc=="_") {
        this.mcc=null;
        this.mnc=null;
    } else {
        var sv=mccmnc.split("_",2);
        if (sv.length==2) {
            this.mcc=sv[0];
            this.mnc=sv[1];
        }
    }
}

function startLogin() {
    console.log("\nFUNCTION: startLogin");
    if (console.log) console.log('Login now');
    if (authorizationEndpoint) {
        if (console.log) console.log('Starting authorization');
        runAuthorization();
    } else {
        if (console.log) console.log('Need active discovery');
        startActiveDiscovery();
    }
    
}

function runAuthorization() {
    console.log("\nFUNCTION: runAuthorization");
    prompt='login';
    max_age=3600;
    acr_values='2';
    login_hint=null;
    if (!!subscriberId) {
    login_hint="ENCR_MSISDN:"+subscriberId;
if (console.log) console.log("login_hint="+login_hint);
    }

    authorizationOptions=new AuthorizationOptions('page', 'en', 'en', 'Enter MSISDN', login_hint, null); 
    state='State'+Math.random().toString(36);
    nonce='Nonce'+Math.random().toString(36);

if (console.log) console.log("Login hint set to "+authorizationOptions['login_hint']);
    authorize(authorizationEndpoint, apiClientID, 'openid profile email', redirect_uri, 'code', state, nonce,
              prompt, max_age, acr_values, authorizationOptions, authorizationCallbackFunction);
}

function authorizationCallbackFunction(data) {
    console.log("\nFUNCTION: authorizationCallbackFunction");
    if (console.log) console.log('authorization complete');
    if (console.log) console.log("response="+JSON.stringify(data));

    code=data['code'];
    state=data['state'];
    error=data['error'];

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

function tokenReceived(token) {
    console.log("\nFUNCTION: tokenReceived");
    if (console.log) console.log("token response="+JSON.stringify(token));
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

function userinfoCallbackFunction(userinfo) {
    console.log("\nFUNCTION: userinfoCallbackFunction");
    if (console.log) console.log("userinfo response="+JSON.stringify(userinfo));
    if (!!userinfo.email) $('#email').val(userinfo.email);
    if (userinfo && userinfo.email_verified!==null) $('#email_verified').val(userinfo.email_verified?'true':'false');
}


function processDiscoveryResult(discoveryResult) {
    console.log("\nFUNCTION: processDiscoveryResult");
    console.log("IN FUNCTION processDiscoveryResult()"+           
                        "\ndiscoveryServiceUri="+discoveryServiceUri+
                        "\ndiscoveryClientID="+discoveryClientID+
                        "\ndiscoveryClientSecret="+discoveryClientSecret+
                        "\nlogoServiceUri="+logoServiceUri+
                        "\nredirect_uri="+redirect_uri);

    operatorIdentified=true;
    operatorName=discoveryResult.getResponse().getServing_operator();
    apiClientID=discoveryResult.getResponse().getClient_id();
    apiClientSecret=discoveryResult.getResponse().getClient_secret();
    subscriberId=discoveryResult.getResponse().getSubscriber_id();
    $('#operatorName').val(operatorName);
    var endpoints=discoveryResult.getResponse().getApi('operatorid');
    
    if (console.log) console.log("apiClientID "+JSON.stringify(apiClientID));
    if (console.log) console.log("apiClientSecret "+JSON.stringify(apiClientSecret));
    if (console.log) console.log("subscriberId "+JSON.stringify(subscriberId));
    if (console.log) console.log("endpoint data "+JSON.stringify(endpoints));
    
    authorizationEndpoint=discoveryResult.getResponse().getApiFunction('operatorid', 'authorization');
    if (console.log) console.log("authorization endpoint "+authorizationEndpoint);
    if (authorizationEndpoint && authorizationEndpoint!=null) {
        operatorIdentified=true;
    }
}

function atStartup() {
    console.log("\nIN FUNCTION atStart()"+           
                        "\ndiscoveryServiceUri="+discoveryServiceUri+
                        "\ndiscoveryClientID="+discoveryClientID+
                        "\ndiscoveryClientSecret="+discoveryClientSecret+
                        "\nlogoServiceUri="+logoServiceUri+
                        "\nredirect_uri="+redirect_uri);

    if (console.log) console.log('defaults');
    if (console.log) console.log('discoveryServiceUri='+discoveryServiceUri);
    if (console.log) console.log('discoveryClientID='+discoveryClientID);
    if (console.log) console.log('discoveryClientSecret='+discoveryClientSecret);
    if (console.log) console.log('logoServiceUri='+logoServiceUri);
    if (console.log) console.log('redirect_uri='+redirect_uri);

    if (!!localStorage.getObject('discoveryServiceUri')) discoveryServiceUri=localStorage.getObject('discoveryServiceUri');
    if (!!localStorage.getObject('discoveryClientID')) discoveryClientID=localStorage.getObject('discoveryClientID');
    if (!!localStorage.getObject('discoveryClientSecret')) discoveryClientSecret=localStorage.getObject('discoveryClientSecret');
    if (!!localStorage.getObject('logoServiceUri')) logoServiceUri=localStorage.getObject('logoServiceUri');
    if (!!localStorage.getObject('redirect_uri')) redirect_uri=localStorage.getObject('redirect_uri');

    if (console.log) console.log('recovered from storage');
    if (console.log) console.log('discoveryServiceUri='+discoveryServiceUri);
    if (console.log) console.log('discoveryClientID='+discoveryClientID);
    if (console.log) console.log('discoveryClientSecret='+discoveryClientSecret);
    if (console.log) console.log('logoServiceUri='+logoServiceUri);
    if (console.log) console.log('redirect_uri='+redirect_uri);

    $('#discoveryUrl').val(discoveryServiceUri);
    $('#clientId').val(discoveryClientID);
    $('#clientSecret').val(discoveryClientSecret);
    $('#logoUrl').val(logoServiceUri);
    $('#redirecturi').val(redirect_uri);
 
    discoveryDetails=getCacheDiscoveryItem();
    if (discoveryDetails) {
        if (discoveryDetails.getTtl()) { console.log("TTL "+discoveryDetails.getTtl()); }
        if (discoveryDetails.getResponse()) {
            if (console.log) console.log("DiscoveryResponse "+JSON.stringify(discoveryDetails.getResponse()));
            processDiscoveryResult(discoveryDetails);
            getLogos();
            $('#discoveryStatus').val('Using cached details');
    }
    }
}

function restoreConfigDefaults() {
    console.log("\nFUNCTION: restoreConfigDefaults");
    discoveryServiceUri=discoveryServiceUriDefault;
    discoveryClientID=discoveryClientIDDefault;
    discoveryClientSecret=discoveryClientSecretDefault;
    logoServiceUri=logoServiceUriDefault;
    redirect_uri=redirect_uriDefault;
    $('#discoveryUrl').val(discoveryServiceUri);
    $('#clientId').val(discoveryClientID);
    $('#clientSecret').val(discoveryClientSecret);
    $('#logoUrl').val(logoServiceUri);
    $('#redirecturi').val(redirect_uri);
    storeConfiguration();
}

function clearDiscoveryCache() {
    console.log("\nFUNCTION: clearDiscoveryCache");
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

function storeConfiguration() {
    console.log("\nFUNCTION: storeConfiguration");
    discoveryServiceUri=$('#discoveryUrl').val();
    discoveryClientID=$('#clientId').val();
    discoveryClientSecret=$('#clientSecret').val();
    logoServiceUri=$('#logoUrl').val();
    redirect_uri=$('#redirecturi').val();

    localStorage.setObject('discoveryServiceUri',$('#discoveryUrl').val());
    localStorage.setObject('discoveryClientID',$('#clientId').val());
    localStorage.setObject('discoveryClientSecret',$('#clientSecret').val());
    localStorage.setObject('logoServiceUri',$('#logoUrl').val());
    localStorage.setObject('redirect_uri',$('#redirecturi').val());
}
