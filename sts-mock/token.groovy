import groovy.json.JsonOutput

def params = parseUrlEncodedBody(context.request.body)
def grantType = params['grant_type']

if (grantType == 'urn:ietf:params:oauth:grant-type:pre-authorized_code') {
    def preAuthorizedCode = params['pre-authorized_code']
    def responseBody = [access_token: "accessToken", token_type: "bearer", expires_in: 180]
    respond().withData(JsonOutput.toJson(responseBody))

} else if (grantType == 'authorization_code') {
    respond().withExampleName('authorization_code_openid')

} else if (grantType == 'urn:ietf:params:oauth:grant-type:token-exchange') {
    respond().withExampleName('token_exchange')

} else if (grantType == 'refresh_token') {
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
