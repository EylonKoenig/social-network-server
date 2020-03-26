const express = require('express')
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const profileBuilder = require('../../utils/profilebuilder');


router.get('/me', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })
            .populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is not profile for this user' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});


router.post('/', [
        auth, [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills id required').not().isEmpty(),
        ]
    ],
    async(req, res) => {
        userId = req.user.id;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const profileFields = profileBuilder(userId, req.body);

        try {
            let profile = await Profile.findOne({ user: userId });
            if (profile) {
                profile = await Profile.findOneAndUpdate({ user: userId }, { $set: profileFields }, { new: true });
                return res.json(profile)
            };
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    }
);







module.exports = router;