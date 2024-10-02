import mongoose from 'lib/mongoose';

const GameSchema = new mongoose.Schema({
  playerOne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  playerTwo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  state: {
    type: String,
    required: true,
  },

  dates: {
    created: {
      type: Date,
      required: true,
    },
    updated: {
      type: Date,
    },
    lastLoggedIn: {
      type: Date,
    },
  },
}, {
  id: false,
  minimize: false,
  toJSON: {
    virtuals: true,
  },
});

// @ts-ignore
const GameModel = mongoose.model('GameScreen', GameSchema);

export {
  GameModel,
  GameSchema
};