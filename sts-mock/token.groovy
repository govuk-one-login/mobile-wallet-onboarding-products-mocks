import groovy.json.JsonOutput
import groovy.json.JsonSlurper

println "Raw token request body: ${context.request.body}"

def params = parseUrlEncodedBody(context.request.body)
def grantType = params['grant_type']
println "Received request with grant_type: ${grantType}"

if (grantType == 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
    def preAuthorizedCode = params['pre-authorized_code']
    println "pre-authorized_code flow, code: ${preAuthorizedCode}"

    if (preAuthorizedCode == "ERROR:401") {
        println "Returning 401 for ERROR:401 trigger"
        respond().withStatusCode(401)
        return

    } else if (preAuthorizedCode == "ERROR:CLIENT") {
        println "Returning 400 errorInvalidClient for ERROR:CLIENT trigger"
        respond().withStatusCode(400).withExampleName('errorInvalidClient')
        return

    } else if (preAuthorizedCode == "ERROR:GRANT") {
        println "Returning 400 errorInvalidGrant for ERROR:GRANT trigger"
        respond().withStatusCode(400).withExampleName('errorInvalidGrant')
        return

    } else if (preAuthorizedCode == "ERROR:500") {
        println "Returning 500 for ERROR:500 trigger"
        respond().withStatusCode(500)
        return
    }

    def payload = parseJwtPayload(preAuthorizedCode)
    println "Parsed JWT payload: ${payload}"

    if (payload.exp < (System.currentTimeMillis() / 1000 as Long)) {
        println "pre-authorized_code expired (exp: ${payload.exp}), returning 400"
        respond().withStatusCode(400).withExampleName('errorInvalidGrantExpiredPreAuthorizedCode')
        return
    }

    def accessToken = buildAccessToken(payload)
    println "Built access token successfully, returning 200"
    def responseBody = [access_token: accessToken, token_type: "bearer", expires_in: 180]
    respond().withData(JsonOutput.toJson(responseBody))

} else if (grantType == 'authorization_code') {
    println "authorization_code flow, returning authorization_code_openid example"
    respond().withExampleName('authorization_code_openid')

} else if (grantType == 'urn:ietf:params:oauth:grant-type:token-exchange') {
    println "token-exchange flow, returning token_exchange example"
    respond().withExampleName('token_exchange')

} else if (grantType == 'refresh_token') {
    println "refresh_token flow, returning refresh_token example"
    respond().withExampleName('refresh_token')
}

/**
 * Parses a URL-encoded request body (application/x-www-form-urlencoded) into a map of key-value pairs.
 *
 * Splits the body on '&' delimiters and decodes each parameter name and value using UTF-8 encoding.
 * Parameters without values (no '=' present) are ignored.
 *
 * @param body The URL-encoded string to parse (e.g., "grant_type=authorization_code&code=abc123")
 * @return A map where keys are decoded parameter names and values are decoded parameter values
 */
static def parseUrlEncodedBody(String body) {
    def params = [:]
    body.split('&').each { param ->
        def parts = param.split('=', 2)
        if (parts.length == 2) {
            params[URLDecoder.decode(parts[0], 'UTF-8')] = URLDecoder.decode(parts[1], 'UTF-8')
        }
    }
    return params
}

/**
 * Parses the payload of a JWT.
 *
 * @param jwt The JWT to parse
 * @return The JWT payload as a map
 */
static def parseJwtPayload(String jwt) {
    def parts = jwt.split('\\.')
    def payloadString = new String(Base64.decoder.decode(parts[1]))
    return new JsonSlurper().parseText(payloadString)
}

/**
 * Builds an access token for the pre-authorized code flow.
 *
 * Decodes the pre-authorized code to extract the credential_identifiers claim, then builds an access token with:
 * - Header: ES256 algorithm, at+jwt type, and a fixed key ID
 * - Payload: subject, issuer, audience, credential identifiers from the pre-authorized code,
 *   a random c_nonce, 180-second expiration, and a random JWT ID
 * - Signature: hardcoded, so not cryptographically valid
 *
 * @param payload The payload of the pre-authorized code as a map
 * @return The access token
 */
def buildAccessToken(Map payload) {
    def selfUrl = System.getenv('SELF_URL') ?: "http://localhost:9090"
    def issuerBaseUrl = System.getenv('CREDENTIAL_ISSUER_URL') ?: "http://localhost:8080"

    def accessTokenPayload = [
            sub                   : "urn:fdc:wallet.account.gov.uk:2024:DtPT8x-dp_73tnlY3KNTiCitziN9GEherD16bqxNt9i",
            iss                   : selfUrl,
            aud                   : issuerBaseUrl,
            credential_identifiers: payload.credential_identifiers,
            c_nonce               : UUID.randomUUID().toString(),
            exp                   : ((System.currentTimeMillis() / 1000) as Long) + 180,
            jti                   : UUID.randomUUID().toString()
    ]
    def encodedPayload = Base64.urlEncoder.withoutPadding().encodeToString(JsonOutput.toJson(accessTokenPayload).bytes)

    def accessTokenHeader = [alg: "ES256", typ: "at+jwt", kid: "C9De3xMDDyG7Nce4kGm09pCamzTMmYefPSmWw4FhnUg"]
    def encodedHeader = Base64.urlEncoder.withoutPadding().encodeToString(JsonOutput.toJson(accessTokenHeader).bytes)

    def encodedSignature = "yBpJ0zhIZWNQqpszXxbil8FmI0DcJ_JG7mHZlrBthVg16lkrcvj662Swl5tpXZbhm-k6LKsmh8CbiiCp-4bRkg"

    return "${encodedHeader}.${encodedPayload}.${encodedSignature}"
}