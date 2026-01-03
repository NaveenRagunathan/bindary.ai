
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('MONGODB_URI is undefined!');
    process.exit(1);
}

// Minimal User Schema for reproduction
const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        image: { type: String },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        provider: { type: String, default: 'credentials' },
        onboardingComplete: { type: Boolean, default: false },
        profile: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function debugAuth() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const email = 'john@abcd.com';
        const password = 'password123';

        console.log(`Checking user: ${email}`);
        const user = await User.findOne({ email }).select('+password');

        if (user) {
            console.log('User FOUND.');
            const isValid = await bcrypt.compare(password, user.password);
            console.log(`Password valid? ${isValid}`);
            if (!isValid) {
                console.log('Hash in DB:', user.password);
                console.log('This explains the "Invalid credentials" error if the user existed from before.');
            }
        } else {
            console.log('User NOT found. Attempting creation...');
            const hashedPassword = await bcrypt.hash(password, 10);
            try {
                const newUser = await User.create({
                    email,
                    name: email.split('@')[0],
                    password: hashedPassword,
                    onboardingComplete: false,
                });
                console.log('User created successfully:', newUser._id);
            } catch (err) {
                console.error('CREATION FAILED:', err);
            }
        }

    } catch (error) {
        console.error('Global Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugAuth();
