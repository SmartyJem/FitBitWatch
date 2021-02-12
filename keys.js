//Resources Allowed to be accessed using the Token
exports.scope = "activity heartrate location nutrition profile settings sleep social weight";

//Time span of which that the Resources is allowed to be accessed '86400' = 1 Day. '604800' = 1 Week
exports.expiresIn = '604800';

//Values used for the client app
exports.data = '';

//Values used to authenticate the user
exports.owner = '';
exports.secretchild = '';
exports.authorizationCode = '';
exports.accessToken = '';

//Fill in these in with your apps details
exports.clientID = '';
exports.clientsecret = '';
exports.callbackURL = 'http://localhost:1337/result';