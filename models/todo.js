var mongoose = require("mongoose");

var todoSchema = new mongoose.Schema({
    item: String,
    isCompleted: {type: Boolean, default: false},
    author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
});
   

module.exports = mongoose.model("Todo", todoSchema);