import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as AppleStrategy } from 'passport-apple';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';

import User from '../../models/user.model.js';
import IndividualUser from '../../models/individualUser.model/individualUser.model.js';
import OrganizationalUser from '../../models/organizationUser.model/organizationUser.model.js';
import OrganizationMember from '../../models/organizationUser.model/organizationMember.model.js';
import jwt from "jsonwebtoken";
import Image from '../../models/image.model.js';

// Ensure correct environment variable access
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth client ID or secret in environment variables.');
}


// Ensure correct environment variable access for Facebook OAuth
if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
  throw new Error('Missing Facebook OAuth app ID or secret in environment variables.');
}

// Ensure correct environment variable access for github OAuth
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
  throw new Error('Missing Github OAuth client ID or secret in environment variables.');
}


// Ensure correct environment variable access for Twitter OAuth
if (!process.env.TWITTER_CONSUMER_KEY || !process.env.TWITTER_CONSUMER_SECRET) {
  throw new Error('Missing Twitter OAuth consumer key or secret in environment variables.');
}

// Ensure correct environment variable access for Apple OAuth
if (!process.env.APPLE_CLIENT_ID || !process.env.APPLE_TEAM_ID || !process.env.APPLE_KEY_ID || !process.env.APPLE_PRIVATE_KEY) {
  throw new Error('Missing Apple OAuth client ID, team ID, key ID, or private key in environment variables.');
}

// Ensure correct environment variable access for LinkedIn OAuth
if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
  throw new Error('Missing LinkedIn OAuth client ID or secret in environment variables.');
}

// Ensure correct environment variable access for Microsoft OAuth
if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
  throw new Error('Missing Microsoft OAuth client ID or secret in environment variables.');
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const profileType = req.session.profileType || 'IndividualUser'; 

    // Find user by email
    let user = await User.findOne({ 'email.id': profile.email });

    if (user) {
      // User exists, check if social login is with Google
      if (user.socialLogin.isSocialLogin && user.socialLogin.provider === 'google') {
        // User uses Google social login, proceed with token creation
        const tokenPayload = {
          id: user._id,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
        return done(null, { user, token });
      } else {
        // Handle case where social login is not Google
        return done(new Error('Email is associated with another social login method.'));
      }
    } else {
      // User does not exist, create a new user
      const userData = {
        email: {
          id: profile.email,
          verified: true, // Assuming Google provides verified emails
        },
        name: {
          first: profile.given_name,
          last: profile.family_name,
        },
        socialLogin: {
          isSocialLogin: true,
          provider: 'google',
        },
        profile: {
          profileType,
        },
      };

      // Create a new user instance
      const newUser = new User(userData);
      user = await newUser.save();

      // Create a document in the specific profile type collection
      let profileModel;
      let profileData = {
        _id: user._id,  
      };

      switch (profileType) {
        case 'IndividualUser':
          profileModel = IndividualUser;
          break;
        case 'OrganizationalUser':
          profileModel = OrganizationalUser;
          profileData = {
            ...profileData,
            name: userData.name.first,  
            contact: {
              email: userData.email.id,  
              phone: userData.phone ? `${userData.phone.countryCode}${userData.phone.number}` : '',  
            }
          };
          break;
        case 'OrganizationMember':
          profileModel = OrganizationMember;
          break;
        default:
          return done(new Error("Invalid profileType"), null);
      }

      // Update the user's profileRef
      await User.findByIdAndUpdate(user._id, {
        $set: {
          "profile.profileRef": user._id,
        },
      });

      // Fetch the profile picture URL
      const profilePictureUrl = profile.picture;

      // Save the profile picture if available
      if (profilePictureUrl) {
        // Create an Image document for the profile picture
        const imageDocument = new Image({
          imageUrl: profilePictureUrl,
          postedBy: user._id,
        });
        const savedImage = await imageDocument.save();

        // Update the user's profilePicture field
        await User.findByIdAndUpdate(user._id, {
          $set: {
            profilePicture: savedImage._id,
          },
        });
      }

      // Create a token for the user
      const tokenPayload = {
        id: user._id,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

      return done(null, { user, token });
    }
  } catch (error) {
    console.error('Error during Google authentication:', error);
    return done(error, null);
  }
}));



passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const profileType = req.session.profileType || 'IndividualUser'; 

    // Find user by email
    let user = await User.findOne({ 'email.id': profile.emails[0].value });

    if (user) {
      // User exists, check if social login is with Facebook
      if (user.socialLogin.isSocialLogin && user.socialLogin.provider === 'facebook') {
        // User uses Facebook social login, proceed with token creation
        const tokenPayload = {
          id: user._id,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

        // Fetch the profile picture URL
        const profilePictureUrl = `https://graph.facebook.com/${profile.id}/picture?type=large`;

        // Create an Image document for the profile picture if not already set
        if (!user.profilePicture) {
          const imageDocument = new Image({
            imageUrl: profilePictureUrl,
            postedBy: user._id,
          });
          const savedImage = await imageDocument.save();

          // Update the user's profilePicture field
          await User.findByIdAndUpdate(user._id, {
            $set: {
              profilePicture: savedImage._id,
            },
          });
        }

        return done(null, { user, token });
      } else {
        // Handle case where social login is not Facebook
        return done(new Error('Email is associated with another social login method.'));
      }
    } else {
      // User does not exist, create a new user
      const userData = {
        email: {
          id: profile.emails[0].value,
          verified: true,
        },
        name: {
          first: profile.name.givenName,
          last: profile.name.familyName,
        },
        socialLogin: {
          isSocialLogin: true,
          provider: 'facebook',
        },
        profile: {
          profileType,
        },
      };

      // Create a new user instance
      const newUser = new User(userData);
      user = await newUser.save();

      // Create a document in the specific profile type collection
      let profileModel;
      let profileData = {
        _id: user._id,  
      };

      switch (profileType) {
        case 'IndividualUser':
          profileModel = IndividualUser;
          break;
        case 'OrganizationalUser':
          profileModel = OrganizationalUser;
          profileData = {
            ...profileData,
            name: userData.name.first,  
            contact: {
              email: userData.email.id,  
              phone: userData.phone ? `${userData.phone.countryCode}${userData.phone.number}` : '',  
            }
          };
          break;
        case 'OrganizationMember':
          profileModel = OrganizationMember;
          break;
        default:
          return done(new Error("Invalid profileType"), null);
      }

      // Update the user's profileRef
      await User.findByIdAndUpdate(user._id, {
        $set: {
          "profile.profileRef": user._id,
        },
      });

      // Save the profile data
      const newProfile = new profileModel(profileData);
      await newProfile.save();

      // Fetch the profile picture URL from Facebook
      const profilePictureUrl = `https://graph.facebook.com/${profile.id}/picture?type=large`;

      // Create an Image document for the profile picture
      const imageDocument = new Image({
        imageUrl: profilePictureUrl,
        postedBy: user._id,
      });
      const savedImage = await imageDocument.save();

      // Update the user's profilePicture field
      await User.findByIdAndUpdate(user._id, {
        $set: {
          profilePicture: savedImage._id,
        },
      });

      // Create a token for the user
      const tokenPayload = {
        id: user._id,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

      return done(null, { user, token });
    }
  } catch (error) {
    console.error('Error during Facebook authentication:', error);
    return done(error, null);
  }
}));



 

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/github/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const profileType = req.session.profileType || 'IndividualUser'; 

    // Fetch the profile picture URL
    const profilePictureUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

    // GitHub doesn't provide email by default, handle accordingly
    let userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

    // If email is not available, prompt user or handle as necessary
    if (!userEmail) {
      // You can inform the user to make their email public or use another social login
      return done(new Error('Make your email address public on GitHub or use another social login method.'));
    }

    // Find user by email
    let user = await User.findOne({ 'email.id': userEmail });

    if (user) {
      // User exists, check if email is verified and social login details
      if (user.email.verified && user.socialLogin.isSocialLogin && user.socialLogin.provider === 'github') {
        // User is verified and uses GitHub social login, proceed with token creation
        const tokenPayload = {
          id: user._id,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
        return done(null, { user, token });
      } else {
        // Handle case where email is not verified or social login is not GitHub
        return done(new Error('Email is not verified or social login with GitHub is not enabled.'));
      }
    } else {
      // User does not exist, create a new user
      const userData = {
        email: {
          id: userEmail,
          verified: true, // Assuming GitHub provides verified emails
        },
        name: {
          first: profile.displayName,
          last: '',  // GitHub doesn't provide last name
        },
        socialLogin: {
          isSocialLogin: true,
          provider: 'github',
        },
        profile: {
          profileType,
        },
      };

      // Create a new user instance
      const newUser = new User(userData);
      user = await newUser.save();

      // Create a document in the specific profile type collection
      let profileModel;
      let profileData = {
        _id: user._id,  
      };

      switch (profileType) {
        case 'IndividualUser':
          profileModel = IndividualUser;
          break;
        case 'OrganizationalUser':
          profileModel = OrganizationalUser;
          profileData = {
            ...profileData,
            name: userData.name.first,  
            contact: {
              email: userData.email.id,  
              phone: userData.phone ? `${userData.phone.countryCode}${userData.phone.number}` : '',  
            }
          };
          break;
        case 'OrganizationMember':
          profileModel = OrganizationMember;
          break;
        default:
          return done(new Error("Invalid profileType"), null);
      }

      // Update the user's profileRef
      await User.findByIdAndUpdate(user._id, {
        $set: {
          "profile.profileRef": user._id,
        },
      });

      // Save the profile data
      const newProfile = new profileModel(profileData);
      await newProfile.save();

      // Fetch and save the profile picture
      if (profilePictureUrl) {
        // Create an Image document for the profile picture
        const imageDocument = new Image({
          imageUrl: profilePictureUrl,
          postedBy: user._id,
        });
        const savedImage = await imageDocument.save();

        // Update the user's profilePicture field
        await User.findByIdAndUpdate(user._id, {
          $set: {
            profilePicture: savedImage._id,
          },
        });
      }

      // Create a token for the user
      const tokenPayload = {
        id: user._id,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

      return done(null, { user, token });
    }
  } catch (error) {
    console.error('Error during GitHub authentication:', error);
    return done(error, null);
  }
}));


passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "http://localhost:3000/auth/twitter/callback",
  includeEmail: true,
  passReqToCallback: true
}, async (req, token, tokenSecret, profile, done) => {
  try {
    const profileType = req.session.profileType || 'IndividualUser'; 

    // Find user by email
    let user = await User.findOne({ 'email.id': profile.emails[0].value });

    if (user) {
      // User exists, check if social login is with Twitter
      if (user.socialLogin.isSocialLogin && user.socialLogin.provider === 'twitter') {
        // User uses Twitter social login, proceed with token creation
        const tokenPayload = {
          id: user._id,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
        return done(null, { user, token });
      } else {
        // Handle case where social login is not Twitter
        return done(new Error('Email is associated with another social login method.'));
      }
    } else {
      // User does not exist, create a new user
      const userData = {
        email: {
          id: profile.emails[0].value,
          verified: true,
        },
        name: {
          first: profile.displayName,
          last: '', // Twitter doesn't provide last name
        },
        socialLogin: {
          isSocialLogin: true,
          provider: 'twitter',
        },
        profile: {
          profileType,
        },
      };

      // Create a new user instance
      const newUser = new User(userData);
      user = await newUser.save();

      // Create a document in the specific profile type collection
      let profileModel;
      let profileData = {
        _id: user._id,  
      };

      switch (profileType) {
        case 'IndividualUser':
          profileModel = IndividualUser;
          break;
        case 'OrganizationalUser':
          profileModel = OrganizationalUser;
          profileData = {
            ...profileData,
            name: userData.name.first,  
            contact: {
              email: userData.email.id,  
              phone: userData.phone ? `${userData.phone.countryCode}${userData.phone.number}` : '',  
            }
          };
          break;
        case 'OrganizationMember':
          profileModel = OrganizationMember;
          break;
        default:
          return done(new Error("Invalid profileType"), null);
      }

      // Update the user's profileRef
      await User.findByIdAndUpdate(user._id, {
        $set: {
          "profile.profileRef": user._id,
        },
      });

      // Save the profile data
      const newProfile = new profileModel(profileData);
      await newProfile.save();

      // Fetch the profile picture URL from profile.photos
      const profilePictureUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

      if (profilePictureUrl) {
        // Create an Image document for the profile picture
        const imageDocument = new Image({
          imageUrl: profilePictureUrl,
          postedBy: user._id,
        });
        const savedImage = await imageDocument.save();

        // Update the user's profilePicture field
        await User.findByIdAndUpdate(user._id, {
          $set: {
            profilePicture: savedImage._id,
          },
        });
      }

      // Create a token for the user
      const tokenPayload = {
        id: user._id,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

      return done(null, { user, token });
    }
  } catch (error) {
    console.error('Error during Twitter authentication:', error);
    return done(error, null);
  }
}));


passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKeyPath: './apple-private-key.p8',
  callbackURL: "http://localhost:3000/auth/apple/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const profileType = req.session.profileType || 'IndividualUser'; 

    // Find user by email
    let user = await User.findOne({ 'email.id': profile.emails[0].value });

    if (user) {
      // User exists, check if social login is with Apple
      if (user.socialLogin.isSocialLogin && user.socialLogin.provider === 'apple') {
        // User uses Apple social login, proceed with token creation
        const tokenPayload = {
          id: user._id,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
        return done(null, { user, token });
      } else {
        // Handle case where social login is not Apple
        return done(new Error('Email is associated with another social login method.'));
      }
    } else {
      // User does not exist, create a new user
      const userData = {
        email: {
          id: profile.emails[0].value,
          verified: true,
        },
        name: {
          first: profile.name.firstName,
          last: profile.name.lastName,
        },
        socialLogin: {
          isSocialLogin: true,
          provider: 'apple',
        },
        profile: {
          profileType,
        },
      };

      // Create a new user instance
      const newUser = new User(userData);
      user = await newUser.save();

      // Create a document in the specific profile type collection
      let profileModel;
      let profileData = {
        _id: user._id,  
      };

      switch (profileType) {
        case 'IndividualUser':
          profileModel = IndividualUser;
          break;
        case 'OrganizationalUser':
          profileModel = OrganizationalUser;
          profileData = {
            ...profileData,
            name: userData.name.first,  
            contact: {
              email: userData.email.id,  
              phone: userData.phone ? `${userData.phone.countryCode}${userData.phone.number}` : '',  
            }
          };
          break;
        case 'OrganizationMember':
          profileModel = OrganizationMember;
          break;
        default:
          return done(new Error("Invalid profileType"), null);
      }

      // Update the user's profileRef
      await User.findByIdAndUpdate(user._id, {
        $set: {
          "profile.profileRef": user._id,
        },
      });

      // Save the profile data
      const newProfile = new profileModel(profileData);
      await newProfile.save();

      // Fetch the profile picture URL from profile.photos
      const profilePictureUrl = `https://appleid.cdn-apple.com/appleid/${profile.picture}`;

      // Create an Image document for the profile picture
      const imageDocument = new Image({
        imageUrl: profilePictureUrl,
        postedBy: user._id,
      });
      const savedImage = await imageDocument.save();

      // Update the user's profilePicture field
      await User.findByIdAndUpdate(user._id, {
        $set: {
          profilePicture: savedImage._id,
        },
      });

      // Create a token for the user
      const tokenPayload = {
        id: user._id,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

      return done(null, { user, token });
    }
  } catch (error) {
    console.error('Error during Apple authentication:', error);
    return done(error, null);
  }
}));

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_liteprofile'],
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const profileType = req.session.profileType || 'IndividualUser'; 

    // Find user by email
    let user = await User.findOne({ 'email.id': profile.emails[0].value });

    if (user) {
      // User exists, check if social login is with LinkedIn
      if (user.socialLogin.isSocialLogin && user.socialLogin.provider === 'linkedin') {
        // User uses LinkedIn social login, proceed with token creation
        const tokenPayload = {
          id: user._id,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
        return done(null, { user, token });
      } else {
        // Handle case where social login is not LinkedIn
        return done(new Error('Email is associated with another social login method.'));
      }
    } else {
      // User does not exist, create a new user
      const userData = {
        email: {
          id: profile.emails[0].value,
          verified: true,
        },
        name: {
          first: profile.name.givenName,
          last: profile.name.familyName,
        },
        socialLogin: {
          isSocialLogin: true,
          provider: 'linkedin',
        },
        profile: {
          profileType,
        },
      };

      // Create a new user instance
      const newUser = new User(userData);
      user = await newUser.save();

      // Create a document in the specific profile type collection
      let profileModel;
      let profileData = {
        _id: user._id,  
      };

      switch (profileType) {
        case 'IndividualUser':
          profileModel = IndividualUser;
          break;
        case 'OrganizationalUser':
          profileModel = OrganizationalUser;
          profileData = {
            ...profileData,
            name: userData.name.first,  
            contact: {
              email: userData.email.id,  
              phone: userData.phone ? `${userData.phone.countryCode}${userData.phone.number}` : '',  
            }
          };
          break;
        case 'OrganizationMember':
          profileModel = OrganizationMember;
          break;
        default:
          return done(new Error("Invalid profileType"), null);
      }

      // Update the user's profileRef
      await User.findByIdAndUpdate(user._id, {
        $set: {
          "profile.profileRef": user._id,
        },
      });

      // Save the profile data
      const newProfile = new profileModel(profileData);
      await newProfile.save();

      // Fetch the profile picture URL from profile.photos
      const profilePictureUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

      if (profilePictureUrl) {
        // Create an Image document for the profile picture
        const imageDocument = new Image({
          imageUrl: profilePictureUrl,
          postedBy: user._id,
        });
        const savedImage = await imageDocument.save();

        // Update the user's profilePicture field
        await User.findByIdAndUpdate(user._id, {
          $set: {
            profilePicture: savedImage._id,
          },
        });
      }

      // Create a token for the user
      const tokenPayload = {
        id: user._id,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

      return done(null, { user, token });
    }
  } catch (error) {
    console.error('Error during LinkedIn authentication:', error);
    return done(error, null);
  }
}));



passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/microsoft/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const profileType = req.session.profileType || 'IndividualUser'; 

    // Find user by email
    let user = await User.findOne({ 'email.id': profile.emails[0].value });

    if (user) {
      // User exists, check if social login is with Microsoft
      if (user.socialLogin.isSocialLogin && user.socialLogin.provider === 'microsoft') {
        // User uses Microsoft social login, proceed with token creation
        const tokenPayload = {
          id: user._id,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
        return done(null, { user, token });
      } else {
        // Handle case where social login is not Microsoft
        return done(new Error('Email is associated with another social login method.'));
      }
    } else {
      // User does not exist, create a new user
      const userData = {
        email: {
          id: profile.emails[0].value,
          verified: true,
        },
        name: {
          first: profile.displayName,
          last: '', // Microsoft doesn't provide last name
        },
        socialLogin: {
          isSocialLogin: true,
          provider: 'microsoft',
        },
        profile: {
          profileType,
        },
      };

      // Create a new user instance
      const newUser = new User(userData);
      user = await newUser.save();

      // Create a document in the specific profile type collection
      let profileModel;
      let profileData = {
        _id: user._id,  
      };

      switch (profileType) {
        case 'IndividualUser':
          profileModel = IndividualUser;
          break;
        case 'OrganizationalUser':
          profileModel = OrganizationalUser;
          profileData = {
            ...profileData,
            name: userData.name.first,  
            contact: {
              email: userData.email.id,  
              phone: userData.phone ? `${userData.phone.countryCode}${userData.phone.number}` : '',  
            }
          };
          break;
        case 'OrganizationMember':
          profileModel = OrganizationMember;
          break;
        default:
          return done(new Error("Invalid profileType"), null);
      }

      // Update the user's profileRef
      await User.findByIdAndUpdate(user._id, {
        $set: {
          "profile.profileRef": user._id,
        },
      });

      // Save the profile data
      const newProfile = new profileModel(profileData);
      await newProfile.save();

      // Fetch the profile picture URL from profile.photos
      const profilePictureUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

      if (profilePictureUrl) {
        // Create an Image document for the profile picture
        const imageDocument = new Image({
          imageUrl: profilePictureUrl,
          postedBy: user._id,
        });
        const savedImage = await imageDocument.save();

        // Update the user's profilePicture field
        await User.findByIdAndUpdate(user._id, {
          $set: {
            profilePicture: savedImage._id,
          },
        });
      }

      // Create a token for the user
      const tokenPayload = {
        id: user._id,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

      return done(null, { user, token });
    }
  } catch (error) {
    console.error('Error during Microsoft authentication:', error);
    return done(error, null);
  }
}));
