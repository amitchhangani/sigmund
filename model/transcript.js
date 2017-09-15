'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var transcriptSchame = new Schema({  
    user_id: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
    patient_id: {
        //type : String
        type: Schema.Types.ObjectId, 
        ref: 'Patient'
    },
    created: {
                type: Date,
                default: Date.now
            }
});

module.exports = mongoose.model('Transcript', transcriptSchame);