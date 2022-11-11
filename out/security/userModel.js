"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
var bcrypt_1 = __importDefault(require("bcrypt"));
//represents a user in the system
var UserModel = /** @class */ (function () {
    //encrypts password
    function UserModel(email, password, isAdmin) {
        var _this = this;
        this.id = '';
        this.email = '';
        this.isAdmin = '';
        this._password = '';
        //includes encrypted password
        this.toObject = function () { return ({ email: _this.email, password: _this.password, isAdmin: _this.isAdmin }); };
        this.email = email;
        this.password = password;
        this.isAdmin = isAdmin;
    }
    Object.defineProperty(UserModel.prototype, "password", {
        //returns encrypted password
        get: function () { return this._password; },
        //when user password is set through here, it is stored encrypted
        set: function (val) {
            this._password = UserModel.encryptString(val);
        },
        enumerable: false,
        configurable: true
    });
    //compares unencrypted password to encrypted password
    UserModel.prototype.validatePassword = function (password) {
        if (this.password === '*') {
            return false;
        }
        return bcrypt_1.default.compareSync(password, this.password);
    };
    //encrypt a string using the bcrypt library
    UserModel.encryptString = function (inval) {
        try {
            var salt = bcrypt_1.default.genSaltSync(10);
            return bcrypt_1.default.hashSync(inval, salt);
        }
        catch (err) {
            return '*';
        }
    };
    //does not encrypt password, expects already encrypted password
    UserModel.fromObject = function (obj) {
        var mdl = new UserModel(obj.email, '', '');
        mdl._password = obj.password;
        mdl.isAdmin = obj.isAdmin;
        return mdl;
    };
    return UserModel;
}());
exports.UserModel = UserModel;
//# sourceMappingURL=userModel.js.map