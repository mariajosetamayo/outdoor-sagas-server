var mongoose = require('mongoose');

var SagaSchema = mongoose.Schema({
    title : {type : String, required : true},
    people : {type : String, required : false},
    date : {type: Date, required: true},
    landmark : {type: String, required: true},
    state : {type: String, required: true},
    country : {type: String, required: true},
    story : {type: String, required: true},
    location: {type: Object, required: false},
    userId: {type: mongoose.Schema.ObjectId, ref: 'UserSchema'},
    imageName: {type : String, required: false}
});

var Saga = mongoose.model('Saga', SagaSchema);

module.exports = Saga;
