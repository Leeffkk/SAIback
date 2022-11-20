"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
//configuration information 
exports.Config = {
    serverport: process.env.PORT || 3000,
    secret: process.env.SECRET || "some-secret-goes-here",
    tokenLife: 1800,
    // url: process.env.MONGOURL || "mongodb://localhost:27017/"
    // url: "mongodb://localhost:27017/"
    url: "mongodb+srv://yufan:yufan@cluster0.5i65efn.mongodb.net/test",
    motionDir: 'motionData/'
};
//# sourceMappingURL=config.js.map