const mongoose = require('mongoose')

const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5
  },
  published: {
    type: Number,
    // validation of year 4 digits format
    validate: {
      validator: (x) => {
      return x >= 1000 && x <= 9999
    },
    message: props => `Published year '${props.value}' needs to be a 4 digit year`
  }

  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  genres: [
    { type: String}
  ]
})

schema.plugin(uniqueValidator)

module.exports = mongoose.model('Book', schema)