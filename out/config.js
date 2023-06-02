"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdConfig = exports.Config = void 0;
//configuration information 
exports.Config = {
    serverport: process.env.PORT || 3000,
    secret: process.env.SECRET || "some-secret-goes-here",
    tokenLife: 1800,
    // url: process.env.MONGOURL || "mongodb://localhost:27017/"
    // url: "mongodb://localhost:27017/"
    url: "mongodb+srv://yufan:yufan@cluster0.5i65efn.mongodb.net/test",
    leadDir: 'leadData/',
    leadCode: 'E:/SeaIceWebsite/SAIback/src/leadCodes/getPrediction.py',
    leadCodeDir: 'E:/SeaIceWebsite/SAIback/src/leadCodes',
    leadPythonDir: 'python',
    motionDir: 'motionData/',
    motionCode: 'E:/SeaIceWebsite/SAIback/src/motionCodes/website_estimate_motion.py',
    motionCodeDir: 'E:/SeaIceWebsite/SAIback/src/motionCodes',
    motionPythonDir: 'python',
    allowed_lead_params: ['WorldView', 'RadarSAT', 'GPRI'],
};
exports.ProdConfig = {
    serverport: process.env.PORT || 4396,
    secret: process.env.SECRET || "some-secret-goes-here",
    tokenLife: 1800,
    // url: process.env.MONGOURL || "mongodb://localhost:27017/"
    // url: "mongodb://localhost:27017/"
    url: "mongodb+srv://yufan:yufan@cluster0.5i65efn.mongodb.net/test",
    leadDir: '/raid1/inprogress/leeff/SAIback/leadData/',
    leadCode: '/raid1/inprogress/leeff/SAIback/src/leadCodes/getPrediction.py',
    leadCodeDir: '/raid1/inprogress/leeff/SAIback/src/leadCodes/',
    leadPythonDir: '/raid1/inprogress/leeff/software/anaconda3/envs/yufan_lead/bin/python',
    motionDir: '/raid1/inprogress/leeff/SAIback/motionData/',
    motionCode: '/raid1/inprogress/leeff/SAIback/src/motionCodes/website_estimate_motion.py',
    motionCodeDir: '/raid1/inprogress/leeff/SAIback/src/motionCodes/',
    motionPythonDir: '/raid1/inprogress/leeff/software/anaconda3/envs/yufan_motion/bin/python',
    allowed_lead_params: ['WorldView', 'RadarSAT', 'GPRI'],
};
//# sourceMappingURL=config.js.map