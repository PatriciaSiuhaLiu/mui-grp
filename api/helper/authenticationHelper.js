var passport = require('passport');
var logger = require("winston");
var msutils = require("msutils");
const jwt = require("jsonwebtoken")
const { isUserAssociatedToGroup, getGroupListAssociated} = require('./groupUtil')

module.exports.getPassport = function getPassport(app) {        
        app.use(passport.initialize());
        app.use(passport.session());
        passport.serializeUser(async function (user, done) {
            var uerFromReq = user.id;
            var userToLogin ;
            var splitUser = uerFromReq.split("@");
           
            if(splitUser[1].toLowerCase() === "ocean.ibm.com"){
                splitUser[1] = "@kyndryl.com";
                userToLogin = splitUser.join("");
            }else{
                userToLogin = user.id
            }
            const [isUserAsssociatedToBg, groups] = await Promise.all([
                isUserAssociatedToGroup(userToLogin, [process.env.prg_admin_blue_grp]),
                getGroupListAssociated(userToLogin)
            ])
            const [isUserAsssociatedToSABg, groups1] = await Promise.all([
                isUserAssociatedToGroup(userToLogin, [process.env.super_admin_blue_grp]),
                getGroupListAssociated(userToLogin)
            ])

            logger.info(`Authentication Helper:: isUserAsssociatedToSABg: ${isUserAsssociatedToSABg} `)

           
            const payload = {
                isUserAsssociatedToBg,
                isUserAsssociatedToSABg,
                groups: [...new Set(groups)],
                groups1: [...new Set(groups1)]
                // groups1: []
            }

            
            const secretKey = process.env.MS_ENCRYPTION_KEY + userToLogin
           
            const token = jwt.sign(payload, secretKey)
            done(null, {
                id: user.id,
                token
            });
        });

        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });

        var client_id =  msutils.decrypt(process.env.client_id);
        var client_secret =  msutils.decrypt(process.env.client_secret);

        var OpenIDConnectStrategy = require('passport-ci-oidc').IDaaSOIDCStrategy;
        var Strategy = new OpenIDConnectStrategy({
            discoveryURL: process.env.discoveryURL,
            authorizationURL: process.env.authorization_url,            
            tokenURL: process.env.token_url,
            clientID:client_id,
            scope: 'openid',
            response_type: 'code',
            clientSecret: client_secret,
            skipUserProfile: true,
            issuer: process.env.issuer_id,
            addCACert: true,
            callbackURL: process.env.SsoCallBackUrlNew,
            CACertPathList: [                
                '/ssl/DigiCertGlobalRootCA.crt',
                '/ssl/DigiCertSHA2SecureServerCA.crt'
            ]
        },
            function (iss, sub, profile, accessToken, refreshToken, params, done) {
                process.nextTick(function () {
                    logger.info(`Successfully authenticated user : ${decodeURI(profile._json.cn)}`);
                    profile.accessToken = accessToken;
                    profile.refreshToken = refreshToken;
                    done(null, profile);
                })
            }
        );      
        passport.use(Strategy);        
        return passport;
    }
    