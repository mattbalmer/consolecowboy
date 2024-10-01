import mongoose from 'lib/mongoose';

const UserSchema = new mongoose.Schema({
  profile: {
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
    },
  },

  contact: {
    email: {
      type: String,
    },
  },

  oauth: {
    googleId: {
      type: String,
      unique: true,
    },
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

UserSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.oauth;
  delete obj.contact;
  return obj;
};

UserSchema.methods.toPrivateJSON = function() {
  let obj = this.toObject();
  delete obj.oauth;
  return obj;
};

UserSchema.statics.findOrCreate = async function(profile) {
  const Model = this;
  try {
    let user = await Model.findOne({
      'oauth.googleId': profile.id,
    });

    const email = profile._json && profile._json.email;
    const avatar = profile._json && profile._json.picture;
    const name = profile.displayName || (profile.name ? profile.name.givenName + ' ' + profile.name.familyName: (email || '') );

    if(user) {
      const now = new Date().getTime();
      user.dates.lastLoggedIn = now;
      if (!user.contact) {
        user.contact = {};
      }
      if (!user.profile) {
        user.profile = {};
      }
      if (user.contact.email !== email) {
        user.dates.updated = now;
        user.contact.email = email;
      }
      if (user.profile.avatar !== avatar) {
        user.dates.updated = now;
        user.profile.avatar = avatar;
      }
      if (user.profile.name !== name) {
        user.dates.updated = now;
        user.profile.name = name;
      }
      user = await user.save();
      return user;
    }

    // @ts-ignore
    user = new Model({
      'oauth.googleId': profile.id,
      profile: {
        name,
        avatar,
      },
      contact: {
        email,
      },
      dates: {
        created: new Date().getTime(),
        updated: new Date().getTime(),
        lastLoggedIn: new Date().getTime(),
      },
    });

    return await user.save();
  } catch(err) {
    console.log('Error in findOrCreate', err);
    throw err;
  }
};

// @ts-ignore
const UserModel = mongoose.model('User', UserSchema);

export {
  UserModel,
  UserSchema
};